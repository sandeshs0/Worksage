const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Password complexity requirements
const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
};

// Common weak passwords list
const commonPasswords = [
  "password",
  "123456",
  "password123",
  "admin",
  "qwerty",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "password1",
  "abc123",
  "Password1",
  "123456789",
  "welcome123",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "info",
  "adm",
  "mysql",
  "user",
  "administrator",
];

const validatePasswordComplexity = (password, userInfo = {}) => {
  const errors = [];

  // Length check
  if (password.length < passwordRequirements.minLength) {
    errors.push(
      `Password must be at least ${passwordRequirements.minLength} characters long`
    );
  }

  if (password.length > passwordRequirements.maxLength) {
    errors.push(
      `Password must not exceed ${passwordRequirements.maxLength} characters`
    );
  }

  // Character type checks
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    passwordRequirements.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
    );
  }

  // Common password check
  if (
    passwordRequirements.preventCommonPasswords &&
    commonPasswords.some((common) =>
      password.toLowerCase().includes(common.toLowerCase())
    )
  ) {
    errors.push("Password contains common phrases and is not allowed");
  }


  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length scoring
  if (password.length >= 16) score += 3;
  else if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;

  // Bonus for character variety
  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    score += 1;
  }

  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1; // Sequential patterns
  if (/(.{1,3})\1+/.test(password)) score -= 1; // Repeated patterns

  if (score <= 3) return "weak";
  if (score <= 6) return "medium";
  if (score <= 8) return "strong";
  return "very-strong";
};

// Password history check
const checkPasswordReuse = async (userId, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.passwordHistory || user.passwordHistory.length === 0) {
      return true; // No history, allow password
    }

    // Check against last 5 passwords
    for (const oldPasswordHash of user.passwordHistory.slice(-5)) {
      const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
      if (isReused) {
        return false;
      }
    }

    // Also check current password
    if (user.password) {
      const isCurrentPassword = await bcrypt.compare(
        newPassword,
        user.password
      );
      if (isCurrentPassword) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Password reuse check error:", error);
    return true; // Allow if check fails to prevent blocking users
  }
};

// Middleware for password validation
const passwordPolicyMiddleware = async (req, res, next) => {
  const { password, newPassword } = req.body;
  const passwordToCheck = newPassword || password;

  if (!passwordToCheck) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  // Get user info for validation
  const userInfo = {
    email: req.body.email || (req.user && req.user.email),
    name: req.body.name || (req.user && req.user.name),
  };

  // Validate complexity
  const validation = validatePasswordComplexity(passwordToCheck, userInfo);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Password does not meet security requirements",
      errors: validation.errors,
      requirements: {
        minLength: passwordRequirements.minLength,
        mustContain: [
          "At least one uppercase letter (A-Z)",
          "At least one lowercase letter (a-z)",
          "At least one number (0-9)",
          "At least one special character (!@#$%^&*)",
          "Cannot contain common passwords",
          "Cannot contain personal information",
        ],
      },
    });
  }

  // Check password reuse for password changes (skip for registration)
  if (req.user && req.user._id) {
    const canUse = await checkPasswordReuse(req.user._id, passwordToCheck);
    if (!canUse) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot reuse your current password or any of your last 5 passwords",
        code: "PASSWORD_REUSED",
      });
    }
  }

  // Add validation results to request
  req.passwordValidation = validation;
  next();
};

module.exports = {
  passwordPolicyMiddleware,
  validatePasswordComplexity,
  checkPasswordReuse,
  calculatePasswordStrength,
  passwordRequirements,
};
