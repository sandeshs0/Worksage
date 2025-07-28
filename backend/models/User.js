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
      // Password expires in 90 days
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
  // Account security fields
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

// Encrypt password using bcrypt before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if password is expired
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
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Add current password to history
  if (this.password) {
    this.passwordHistory.push(this.password);

    // Keep only last 5 passwords
    if (this.passwordHistory.length > 5) {
      this.passwordHistory = this.passwordHistory.slice(-5);
    }
  }

  // Update password and related fields
  this.password = hashedPassword;
  this.passwordChangedAt = new Date();
  this.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  this.mustChangePassword = false;

  return this.save();
};

// Create a virtual for full name that combines first and last name
UserSchema.virtual("fullName").get(function () {
  return this.name;
});

// Make virtuals available when converting to JSON
UserSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
