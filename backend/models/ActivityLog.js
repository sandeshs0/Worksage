const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  method: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: false,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: false,
  },
  query: {
    type: Object,
    required: false,
  },
  body: {
    type: Object,
    required: false,
  },
  isSecurityEvent: {
    type: Boolean,
    default: false,
  },
  securityEvents: [
    {
      type: {
        type: String,
        enum: [
          "NoSQL_INJECTION_ATTEMPT",
          "XSS_ATTEMPT",
          "RATE_LIMIT_EXCEEDED",
          "SUSPICIOUS_ACTIVITY",
        ],
      },
      path: String,
      value: String,
      timestamp: Date,
      ip: String,
      userAgent: String,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
