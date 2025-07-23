const ActivityLog = require("../models/ActivityLog");

// Middleware to log all API requests
async function activityLogger(req, res, next) {
  // Only log API routes (optional: adjust as needed)
  if (!req.originalUrl.startsWith("/api")) return next();

  // Save original send to capture status
  const originalSend = res.send;
  let responseStatus;
  res.send = function (body) {
    responseStatus = res.statusCode;
    res.send = originalSend;
    return res.send(body);
  };

  // After response is finished, log the activity
  res.on("finish", async () => {
    try {
      // Avoid logging the log endpoint itself to prevent recursion
      if (req.originalUrl.startsWith("/api/admin/activity-logs")) return;

      // Create base log entry
      const logEntry = {
        user: req.user ? req.user._id : undefined,
        method: req.method,
        endpoint: req.originalUrl,
        status: responseStatus || res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        query: req.query,
        // Only log non-sensitive body fields (avoid passwords, tokens, etc.)
        body: filterBody(req.body),
      };

      // Add security events if any were logged during request processing
      if (req.securityLog && req.securityLog.length > 0) {
        logEntry.securityEvents = req.securityLog;
        logEntry.isSecurityEvent = true;
      }

      await ActivityLog.create(logEntry);
    } catch (err) {
      // Don't block request on logging error
      console.error("Activity log error:", err);
    }
  });

  next();
}

// Helper to filter sensitive fields from body
function filterBody(body) {
  if (!body) return undefined;
  const filtered = { ...body };
  ["password", "token", "accessToken", "refreshToken"].forEach((key) => {
    if (filtered[key]) filtered[key] = "[REDACTED]";
  });
  return filtered;
}

module.exports = activityLogger;
