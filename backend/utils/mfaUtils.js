const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Encryption key from environment (should be 32 bytes)
const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a secret for secure storage
 */
const encryptSecret = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Error encrypting secret:', error);
    throw new Error('Failed to encrypt secret');
  }
};

/**
 * Decrypt a secret from storage
 */
const decryptSecret = (encryptedData) => {
  try {
    const { encrypted, iv, authTag } = encryptedData;
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting secret:', error);
    throw new Error('Failed to decrypt secret');
  }
};

/**
 * Generate a new MFA secret for a user
 */
const generateMFASecret = (userEmail, serviceName = 'Worksage') => {
  try {
    const secret = speakeasy.generateSecret({
      name: `${serviceName} (${userEmail})`,
      issuer: serviceName,
      length: 32
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      manualEntryKey: secret.base32
    };
  } catch (error) {
    console.error('Error generating MFA secret:', error);
    throw new Error('Failed to generate MFA secret');
  }
};

/**
 * Generate QR code data URL for the secret
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify a TOTP token against a secret
 */
const verifyTOTP = (token, secret, window = 1) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: window, // Allow 1 step before/after for clock drift
    });
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
};

/**
 * Generate backup codes for the user
 */
const generateBackupCodes = (count = 10) => {
  try {
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push({
        code: code,
        used: false,
        createdAt: new Date()
      });
    }
    
    return codes;
  } catch (error) {
    console.error('Error generating backup codes:', error);
    throw new Error('Failed to generate backup codes');
  }
};

/**
 * Verify a backup code
 */
const verifyBackupCode = (inputCode, backupCodes) => {
  try {
    const code = backupCodes.find(
      bc => bc.code.toLowerCase() === inputCode.toLowerCase() && !bc.used
    );
    
    if (code) {
      code.used = true;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
};

/**
 * Check if user has unused backup codes
 */
const hasUnusedBackupCodes = (backupCodes) => {
  return backupCodes && backupCodes.some(code => !code.used);
};

module.exports = {
  encryptSecret,
  decryptSecret,
  generateMFASecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  verifyBackupCode,
  hasUnusedBackupCodes
};
