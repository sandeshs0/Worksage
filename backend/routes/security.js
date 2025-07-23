const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");

// Endpoint for logging XSS attempts from frontend
router.post("/log-xss-attempt", async (req, res) => {
  try {
    const { field, threats, userAgent, url, timestamp } = req.body;

    // Create security log entry
    const logEntry = await ActivityLog.create({
      type: "security",
      action: "xss_attempt",
      userId: req.user ? req.user.id : null,
      ip: req.ip || req.connection.remoteAddress || "unknown",
      endpoint: url || "frontend",
      userAgent: userAgent || req.get("User-Agent"),
      method: "FRONTEND",
      details: `Frontend XSS attempt detected in field: ${field}. Threats: ${threats.join(
        ", "
      )}`,
      severity: "high",
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      metadata: {
        field,
        threats,
        source: "frontend",
        blocked: true,
      },
    });

    res.json({
      success: true,
      message: "XSS attempt logged successfully",
      logId: logEntry._id,
    });
  } catch (error) {
    console.error("Error logging XSS attempt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log XSS attempt",
    });
  }
});

module.exports = router;
