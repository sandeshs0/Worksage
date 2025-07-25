const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }, // Required only if not signing up with Google
    minlength: 6,
  },
  role: {
    type: String,
    // enum: ['designer', 'developer', 'writer', 'project manager', 'freelancer', 'unassigned'],
    default: "unassigned",
  },
  googleId: {
    type: String,
  },
  profileImage: {
    type: String, // URL to the profile image
    default: null,
  },
  plan: {
    type: String,
    enum: ["free", "pro", "vantage"],
    default: "free",
  },
  planExpiry: {
    type: Date,
    default: null, // null means no expiry (for free plan)
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // Password security fields
  passwordHistory: [
    {
      type: String, // Store hashed passwords
      createdAt: { type: Date, default: Date.now },
    },
  ],
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  passwordExpiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    },
  },
  mustChangePassword: {
    type: Boolean,
    default: false,
  },
  // MFA fields
  mfa: {
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String, // Encrypted TOTP secret
      select: false, // Don't include in queries by default
    },
    backupCodes: [
      {
        code: {
          type: String,
          required: true,
        },
        used: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastUsedAt: Date,
    setupAt: Date, // When MFA was first enabled
  },

  accountLocked: {
    type: Boolean,
    default: false,
  },
  lockoutUntil: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypting password using bcrypt before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  console.log(`Pre-save middleware: Hashing password for user: ${this.email}`);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log(
    `Pre-save middleware: Password hashed successfully for user: ${this.email}`
  );
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  console.log(`Comparing password for user: ${this.email}`);
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log(`Password match result: ${isMatch}`);
  return isMatch;
};

UserSchema.methods.isPasswordExpired = function () {
  return this.passwordExpiresAt && this.passwordExpiresAt < new Date();
};

// Method to check if account is locked
UserSchema.methods.isAccountLocked = function () {
  return (
    this.accountLocked || (this.lockoutUntil && this.lockoutUntil > new Date())
  );
};

// Method to update password with history
UserSchema.methods.updatePasswordWithHistory = async function (newPassword) {
  console.log(`Updating password with history for user: ${this.email}`);

  // Add current password to history (if it exists and is hashed)
  if (this.password) {
    this.passwordHistory.push(this.password);

    // Keep only last 5 passwords
    if (this.passwordHistory.length > 5) {
      this.passwordHistory = this.passwordHistory.slice(-5);
    }
  }

  // Set new password as plain text - pre-save middleware will handle hashing
  this.password = newPassword;
  this.passwordChangedAt = new Date();
  this.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  this.mustChangePassword = false;

  console.log(`Password update completed for user: ${this.email}`);
  return this.save(); // Pre-save middleware will hash the password
};

// Create a virtual for full name that combines first and last name
UserSchema.virtual("fullName").get(function () {
  return this.name;
});

// Make virtuals available when converting to JSON
UserSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
