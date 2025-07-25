const ActivityLog = require("../models/ActivityLog");

async function activityLogger(req, res, next) {  
  if (!req.originalUrl.startsWith("/api")) return next();
  const originalSend = res.send;
  let responseStatus;
  res.send = function (body) {
    responseStatus = res.statusCode;
    res.send = originalSend;
    return res.send(body);
  };
  res.on("finish", async () => {
    try {  
      if (req.originalUrl.startsWith("/api/admin/activity-logs")) return;
      const logEntry = {
        user: req.user ? req.user._id : undefined,
        method: req.method,
        endpoint: req.originalUrl,
        status: responseStatus || res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        query: req.query,
        body: filterBody(req.body),
      };
      if (req.securityLog && req.securityLog.length > 0) {
        logEntry.securityEvents = req.securityLog;
        logEntry.isSecurityEvent = true;
      }
      await ActivityLog.create(logEntry);
    } catch (err) {
      console.error("Activity log error:", err);
    }
  });
  next();
}


function filterBody(body) {
  if (!body) return undefined;
  const filtered = { ...body };
  ["password", "token", "accessToken", "refreshToken"].forEach((key) => {
    if (filtered[key]) filtered[key] = "[REDACTED]";
  });
  return filtered;
}

module.exports = activityLogger;
