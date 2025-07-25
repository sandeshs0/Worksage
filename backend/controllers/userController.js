const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const { uploadProfileImage } = require("../middleware/upload");

exports.getProfile = async (req, res) => {
  try {
    // Use req.user._id instead of req.user.id
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select(
      "-password -otp -otpExpires -mfa.secret"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Add MFA status without sensitive data
    const userData = user.toObject();
    if (userData.mfa) {
      userData.mfa = {
        enabled: user.mfa.enabled || false,
        setupAt: user.mfa.setupAt,
        lastUsedAt: user.mfa.lastUsedAt,
        backupCodesRemaining: user.mfa.backupCodes
          ? user.mfa.backupCodes.filter((code) => !code.used).length
          : 0,
      };
    }

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const profileFields = {};

    if (name) profileFields.name = name;
    if (email) profileFields.email = email.toLowerCase();
    if (role) profileFields.role = role;

    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update profile picture
// @route   PUT /api/users/me/avatar
// @access  Private
exports.updateProfilePicture = [
  uploadProfileImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Please upload a file" });
      }

      const userId = req.user._id || req.user.id;
      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage: req.file.path },
        { new: true }
      ).select("-password -otp -otpExpires");

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
];

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get user
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "You signed up with Google Account. Please use the password reset option instead",
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Use the robust password update method with history tracking
    await user.updatePasswordWithHistory(newPassword);

    res.json({
      success: true,
      message: "Password updated successfully",
      passwordExpiresAt: user.passwordExpiresAt,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    }

    // Generate reset token (using OTP field for simplicity)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.otp = resetToken;
    user.otpExpires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password.

Please click on the following link, or paste this into your browser to complete the process:

${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.

This reset link will expire in 1 hour.

For security reasons, if you didn't request this password reset, please contact our support team immediately.

Best regards,
The Worksage Team`;

      await sendEmail({
        email: user.email,
        subject: "Password Reset Request - Worksage",
        message,
      });

      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    res.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent",
      // In development, return the token for testing
      ...(process.env.NODE_ENV === "development" && { token: resetToken }),
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate input
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by token and check expiration
    const user = await User.findOne({
      otp: token,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Use the robust password update method with history tracking
    console.log(`Resetting password for user: ${user.email}`);
    await user.updatePasswordWithHistory(password);
    console.log(`Password reset successful for user: ${user.email}`);

    // Clear reset token
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send password changed confirmation email
    try {
      const message = `Hello,

Your password for your Worksage account has been successfully reset.

If you did not make this change, please contact our support team immediately as your account may have been compromised.

For your security, we recommend:
- Using a strong, unique password
- Enabling two-factor authentication
- Regularly reviewing your account activity

Best regards,
The Worksage Team`;

      await sendEmail({
        email: user.email,
        subject: "Password Successfully Reset - Worksage",
        message,
      });

      console.log(`Password reset confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        "Error sending password reset confirmation email:",
        emailError
      );
      // Don't fail the request if email fails, but log it
    }

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin-only methods

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-password -otp -otpExpires -passwordHistory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({});

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -otp -otpExpires -passwordHistory"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires -passwordHistory");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user status (active/inactive)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires -passwordHistory");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User account ${isActive ? "activated" : "deactivated"}`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
