const User = require('../models/User');
const {
  generateMFASecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  verifyBackupCode,
  encryptSecret,
  decryptSecret,
  hasUnusedBackupCodes
} = require('../utils/mfaUtils');
const { decodeHTMLEntities } = require('../utils/htmlUtils');

// @desc    Setup MFA - Generate QR code and secret
// @route   POST /api/auth/mfa/setup
// @access  Private
exports.setupMFA = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled for this account'
      });
    }

    // Generate new secret
    const mfaData = generateMFASecret(user.email);
    
    // Generate QR code
    const qrCodeDataURL = await generateQRCode(mfaData.qrCodeUrl);

    // Store encrypted secret temporarily (not enabled yet)
    const encryptedSecret = encryptSecret(mfaData.secret);
    
    // Don't save to DB yet - just return for verification
    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        manualEntryKey: mfaData.manualEntryKey,
        backupUrl: mfaData.qrCodeUrl
      },
      // Temporary secret for verification (encrypt in production)
      tempSecret: JSON.stringify(encryptedSecret)
    });

  } catch (error) {
    console.error('Error setting up MFA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup MFA'
    });
  }
};

// @desc    Verify MFA setup and enable
// @route   POST /api/auth/mfa/verify-setup
// @access  Private
exports.verifyMFASetup = async (req, res) => {
  try {
    const { token, tempSecret } = req.body;
    const userId = req.user._id || req.user.id;

    if (!token || !tempSecret) {
      return res.status(400).json({
        success: false,
        message: 'Token and temporary secret are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled'
      });
    }

    // Decrypt the temporary secret
    console.log('Received tempSecret:', tempSecret);
    console.log('Type of tempSecret:', typeof tempSecret);
    
    let encryptedSecret;
    try {
      // Check if tempSecret is already an object or needs parsing
      if (typeof tempSecret === 'string') {
        // Decode HTML entities if present
        const decodedSecret = decodeHTMLEntities(tempSecret);
        console.log('Decoded tempSecret:', decodedSecret);
        encryptedSecret = JSON.parse(decodedSecret);
      } else {
        encryptedSecret = tempSecret;
      }
    } catch (parseError) {
      console.error('Error parsing tempSecret:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid temporary secret format'
      });
    }
    
    const secret = decryptSecret(encryptedSecret);

    // Verify the token
    const isValid = verifyTOTP(token, secret);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Save MFA settings to user
    user.mfa = {
      enabled: true,
      secret: JSON.stringify(encryptedSecret),
      backupCodes: backupCodes,
      setupAt: new Date(),
      lastUsedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'MFA enabled successfully',
      data: {
        backupCodes: backupCodes.map(bc => bc.code),
        enabled: true
      }
    });

  } catch (error) {
    console.error('Error verifying MFA setup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify MFA setup'
    });
  }
};

// @desc    Disable MFA
// @route   POST /api/auth/mfa/disable
// @access  Private
exports.disableMFA = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id || req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to disable MFA'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled'
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Disable MFA
    user.mfa = {
      enabled: false,
      secret: undefined,
      backupCodes: [],
      setupAt: undefined,
      lastUsedAt: undefined
    };

    await user.save();

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });

  } catch (error) {
    console.error('Error disabling MFA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable MFA'
    });
  }
};

// @desc    Get MFA status
// @route   GET /api/auth/mfa/status
// @access  Private
exports.getMFAStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('mfa');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const unusedBackupCodes = user.mfa.backupCodes 
      ? user.mfa.backupCodes.filter(code => !code.used).length 
      : 0;

    res.json({
      success: true,
      data: {
        enabled: user.mfa.enabled || false,
        setupAt: user.mfa.setupAt,
        lastUsedAt: user.mfa.lastUsedAt,
        backupCodesRemaining: unusedBackupCodes
      }
    });

  } catch (error) {
    console.error('Error getting MFA status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MFA status'
    });
  }
};

// @desc    Regenerate backup codes
// @route   POST /api/auth/mfa/regenerate-backup-codes
// @access  Private
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id || req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to regenerate backup codes'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled'
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();
    user.mfa.backupCodes = newBackupCodes;
    await user.save();

    res.json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes: newBackupCodes.map(bc => bc.code)
      }
    });

  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate backup codes'
    });
  }
};

// @desc    Verify MFA token during login
// @route   POST /api/auth/mfa/verify
// @access  Public (but requires valid login session)
exports.verifyMFA = async (req, res) => {
  try {
    const { token, isBackupCode = false, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Token and user ID are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.mfa.enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled for this user'
      });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      isValid = verifyBackupCode(token, user.mfa.backupCodes);
      if (isValid) {
        await user.save(); // Save the updated backup codes
      }
    } else {
      // Verify TOTP
      const encryptedSecret = JSON.parse(user.mfa.secret);
      const secret = decryptSecret(encryptedSecret);
      isValid = verifyTOTP(token, secret);
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: isBackupCode ? 'Invalid backup code' : 'Invalid verification code'
      });
    }

    // Update last used timestamp
    user.mfa.lastUsedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'MFA verification successful'
    });

  } catch (error) {
    console.error('Error verifying MFA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify MFA'
    });
  }
};
