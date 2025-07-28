const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const TokenService = require("../services/tokenService");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// Legacy token generation for OAuth compatibility
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper function to get client info
const getClientInfo = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
  };
};

const verifyRecaptcha = require("../utils/verifyRecaptcha");
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      return res.status(400).json({
        success: false,
        message: "Captcha verification failed. Please try again.",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send verification email
    const message = `Your OTP for Worksage verification is: ${otp}\nThis code will expire in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: "Email Verification - Worksage",
      message,
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for the verification OTP.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or OTP has expired",
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create session with new token system
    const { ipAddress, userAgent } = getClientInfo(req);
    const tokens = await TokenService.createSession(
      user._id,
      ipAddress,
      userAgent
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        accessToken: tokens.accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const { ipAddress, userAgent } = getClientInfo(req);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account was created with Google. Please use Google sign-in",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password has expired
    if (user.isPasswordExpired()) {
      return res.status(401).json({
        success: false,
        message: "Your password has expired. Please reset your password.",
        code: "PASSWORD_EXPIRED",
        requiresPasswordReset: true
      });
    }

    // Check if user must change password
    if (user.mustChangePassword) {
      return res.status(401).json({
        success: false,
        message: "You must change your password before continuing.",
        code: "MUST_CHANGE_PASSWORD",
        requiresPasswordChange: true
      });
    }

    // Check if MFA is enabled for this user
    if (user.mfa && user.mfa.enabled) {
      // Don't create full session yet, return MFA challenge
      return res.json({
        success: true,
        requiresMFA: true,
        message: "Please enter your two-factor authentication code",
        userId: user._id,
        tempData: {
          ipAddress,
          userAgent
        }
      });
    }

    // Create session with new token system
    const tokens = await TokenService.createSession(
      user._id,
      ipAddress,
      userAgent
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: tokens.accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Complete MFA Login
// @route   POST /api/auth/mfa-login
// @access  Public
exports.completeMFALogin = async (req, res) => {
  try {
    const { userId, mfaToken, isBackupCode, tempData } = req.body;

    if (!userId || !mfaToken || !tempData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Verify MFA token
    const mfaController = require('./mfaController');
    const mfaResult = await mfaController.verifyMFA({
      body: { token: mfaToken, isBackupCode, userId }
    }, {
      status: (code) => ({ json: (data) => ({ code, data }) }),
      json: (data) => data
    });

    if (mfaResult.code && mfaResult.code !== 200) {
      return res.status(400).json({
        success: false,
        message: "Invalid MFA token"
      });
    }

    // Get user and create session
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create session with original login data
    const tokens = await TokenService.createSession(
      user._id,
      tempData.ipAddress,
      tempData.userAgent
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: tokens.accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (error) {
    console.error("MFA Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during MFA login",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    const { ipAddress, userAgent } = getClientInfo(req);

    const result = await TokenService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    // Clear invalid refresh token
    res.clearCookie("refreshToken");

    res.status(401).json({
      success: false,
      message: error.message || "Failed to refresh token",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await TokenService.revokeSession(refreshToken);
    }

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    await TokenService.revokeAllUserSessions(req.user._id);

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await TokenService.getUserSessions(req.user._id);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sessions",
    });
  }
};

exports.updateRole = async (req, res) => {
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

    const allowedRoles = [
      "designer",
      "developer",
      "writer",
      "project manager",
      "freelancer",
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during role update",
    });
  }
};

// Export legacy token generation for OAuth compatibility
exports.generateToken = generateToken;
