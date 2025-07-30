const User = require("../models/User");
const {
  generateMFASecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  verifyBackupCode,
  encryptSecret,
  decryptSecret,
  hasUnusedBackupCodes,
  resetUserMFA,
} = require("../utils/mfaUtils");
const { decodeHTMLEntities } = require("../utils/htmlUtils");
exports.setupMFA = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is already enabled for this account",
      });
    }
    const mfaData = generateMFASecret(user.email);
    const qrCodeDataURL = await generateQRCode(mfaData.qrCodeUrl);
    const encryptedSecret = encryptSecret(mfaData.secret);
    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        manualEntryKey: mfaData.manualEntryKey,
        backupUrl: mfaData.qrCodeUrl,
      },
      tempSecret: JSON.stringify(encryptedSecret),
    });
  } catch (error) {
    console.error("Error setting up MFA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to setup MFA",
    });
  }
};

exports.verifyMFASetup = async (req, res) => {
  try {
    const { token, tempSecret } = req.body;
    const userId = req.user._id || req.user.id;

    if (!token || !tempSecret) {
      return res.status(400).json({
        success: false,
        message: "Token and temporary secret are required",
      });
    }

    const user = await User.findById(userId).select("+mfa.secret");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is already enabled",
      });
    }

    //console.log("Received tempSecret:", tempSecret);
    //console.log("Type of tempSecret:", typeof tempSecret);

    let encryptedSecret;
    try {
      if (typeof tempSecret === "string") {
        const decodedSecret = decodeHTMLEntities(tempSecret);
        //console.log("Decoded tempSecret:", decodedSecret);
        encryptedSecret = JSON.parse(decodedSecret);
      } else {
        encryptedSecret = tempSecret;
      }
    } catch (parseError) {
      console.error("Error parsing tempSecret:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid temporary secret format",
      });
    }

    const secret = decryptSecret(encryptedSecret);

    const isValid = verifyTOTP(token, secret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    const backupCodes = generateBackupCodes();

    user.mfa = {
      enabled: true,
      secret: JSON.stringify(encryptedSecret),
      backupCodes: backupCodes,
      setupAt: new Date(),
      lastUsedAt: new Date(),
    };

    await user.save();

    res.json({
      success: true,
      message: "MFA enabled successfully",
      data: {
        backupCodes: backupCodes.map((bc) => bc.code),
        enabled: true,
      },
    });
  } catch (error) {
    console.error("Error verifying MFA setup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify MFA setup",
    });
  }
};

exports.disableMFA = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id || req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to disable MFA",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is not enabled",
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    user.mfa = {
      enabled: false,
      secret: undefined,
      backupCodes: [],
      setupAt: undefined,
      lastUsedAt: undefined,
    };

    await user.save();

    res.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error) {
    console.error("Error disabling MFA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disable MFA",
    });
  }
};

exports.getMFAStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("mfa");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const unusedBackupCodes = user.mfa.backupCodes
      ? user.mfa.backupCodes.filter((code) => !code.used).length
      : 0;

    res.json({
      success: true,
      data: {
        enabled: user.mfa.enabled || false,
        setupAt: user.mfa.setupAt,
        lastUsedAt: user.mfa.lastUsedAt,
        backupCodesRemaining: unusedBackupCodes,
      },
    });
  } catch (error) {
    console.error("Error getting MFA status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get MFA status",
    });
  }
};

exports.regenerateBackupCodes = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id || req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to regenerate backup codes",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is not enabled",
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const newBackupCodes = generateBackupCodes();
    user.mfa.backupCodes = newBackupCodes;
    await user.save();

    res.json({
      success: true,
      message: "Backup codes regenerated successfully",
      data: {
        backupCodes: newBackupCodes.map((bc) => bc.code),
      },
    });
  } catch (error) {
    console.error("Error regenerating backup codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate backup codes",
    });
  }
};

exports.verifyMFA = async (req, res) => {
  try {
    const { token, isBackupCode = false, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: "Token and user ID are required",
      });
    }

    const user = await User.findById(userId).select("+mfa.secret");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is not enabled for this user",
      });
    }

    let isValid = false;

    if (isBackupCode) {
      isValid = verifyBackupCode(token, user.mfa.backupCodes);
      if (isValid) {
        await user.save();
      }
    } else {
      //console.log("Verifying TOTP for user:", userId);
      //console.log("User MFA object:", user.mfa);
      //console.log("User MFA secret:", user.mfa.secret);

      if (!user.mfa.secret) {
        return res.status(400).json({
          success: false,
          message: "MFA secret not found for user",
        });
      }

      let encryptedSecret;
      try {
        encryptedSecret = JSON.parse(user.mfa.secret);
      } catch (parseError) {
        console.error("Failed to parse MFA secret:", parseError);
        return res.status(500).json({
          success: false,
          message: "Invalid MFA secret format",
        });
      }

      const secret = decryptSecret(encryptedSecret);
      isValid = verifyTOTP(token, secret);
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: isBackupCode
          ? "Invalid backup code"
          : "Invalid verification code",
      });
    }

    user.mfa.lastUsedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "MFA verification successful",
    });
  } catch (error) {
    console.error("Error verifying MFA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify MFA",
    });
  }
};

exports.resetMFA = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const success = await resetUserMFA(userId);

    if (success) {
      res.json({
        success: true,
        message: "MFA has been reset. You can now set it up again.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to reset MFA",
      });
    }
  } catch (error) {
    console.error("Error resetting MFA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset MFA",
    });
  }
};
