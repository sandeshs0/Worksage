const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
};
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

  if (password.length >= 16) score += 3;
  else if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;

  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    score += 1;
  }

  if (/(.)\1{2,}/.test(password)) score -= 1;
  if (/123|abc|qwe/i.test(password)) score -= 1;
  if (/(.{1,3})\1+/.test(password)) score -= 1;

  if (score <= 3) return "weak";
  if (score <= 6) return "medium";
  if (score <= 8) return "strong";
  return "very-strong";
};

const checkPasswordReuse = async (userId, newPassword) => {
  try {
    //console.log(`Checking password reuse for user: ${userId}`);
    
    const user = await User.findById(userId).select(
      "+password +passwordHistory"
    );
    if (!user || !user.passwordHistory || user.passwordHistory.length === 0) {
      //console.log(
        `No password history found for user: ${userId} (history length: ${
          user?.passwordHistory?.length || 0
        })`
      );
      return true;
    }

    //console.log(
      `Checking against ${user.passwordHistory.length} passwords in history (last 3)`
    );
    
    for (const oldPasswordHash of user.passwordHistory.slice(-3)) {
      const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
      if (isReused) {
        //console.log(
          `Password reuse detected for user: ${userId} - matches history`
        );
        return false;
      }
    }

    
    if (user.password) {
      const isCurrentPassword = await bcrypt.compare(
        newPassword,
        user.password
      );
      if (isCurrentPassword) {
        //console.log(
          `Password reuse detected for user: ${userId} - matches current password`
        );
        return false;
      }
    }

    //console.log(`Password reuse check passed for user: ${userId}`);
    return true;
  } catch (error) {
    console.error("Password reuse check error:", error);
    return true;
  }
};

const passwordPolicyMiddleware = async (req, res, next) => {
  //console.log(
    `Password policy middleware triggered for route: ${req.route?.path}`
  );
  const { password, newPassword } = req.body;
  const passwordToCheck = newPassword || password;

  if (!passwordToCheck) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  const userInfo = {
    email: req.body.email || (req.user && req.user.email),
    name: req.body.name || (req.user && req.user.name),
  };

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

  
  if (req.user && req.user._id) {
    //console.log(
      `Checking password reuse for authenticated user: ${req.user._id}`
    );
    const canUse = await checkPasswordReuse(req.user._id, passwordToCheck);
    if (!canUse) {
      //console.log(`Password reuse validation failed for user: ${req.user._id}`);
      return res.status(400).json({
        success: false,
        message:
          "Cannot reuse your current password or any of your last 3 passwords",
        code: "PASSWORD_REUSED",
      });
    }
    //console.log(`Password reuse validation passed for user: ${req.user._id}`);
  }

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
