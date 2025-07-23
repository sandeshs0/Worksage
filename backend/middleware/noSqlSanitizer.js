const validator = require("validator");

// Custom NoSQL injection prevention middleware
const noSqlSanitizer = (req, res, next) => {
  // Common NoSQL injection patterns to detect and prevent
  const dangerousPatterns = [
    /\$where/gi,
    /\$ne/gi,
    /\$nin/gi,
    /\$gt/gi,
    /\$gte/gi,
    /\$lt/gi,
    /\$lte/gi,
    /\$or/gi,
    /\$and/gi,
    /\$nor/gi,
    /\$not/gi,
    /\$exists/gi,
    /\$type/gi,
    /\$mod/gi,
    /\$regex/gi,
    /\$text/gi,
    /\$search/gi,
    /\$all/gi,
    /\$size/gi,
    /\$elemMatch/gi,
    /\$slice/gi,
    /javascript:/gi,
    /\$function/gi,
    /\$accumulator/gi,
    /eval\(/gi,
    /Function\(/gi,
  ];

  // Function to recursively sanitize objects
  const sanitizeObject = (obj, path = "") => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      // Check for dangerous patterns
      for (const pattern of dangerousPatterns) {
        if (pattern.test(obj)) {
          console.warn(
            `🚨 Potential NoSQL injection detected at ${path}: ${obj.substring(
              0,
              100
            )}... from IP: ${req.ip}`
          );

          // Log to activity logger for security monitoring
          if (req.securityLog) {
            req.securityLog.push({
              type: "NoSQL_INJECTION_ATTEMPT",
              path: path,
              value: obj.substring(0, 100),
              timestamp: new Date(),
              ip: req.ip,
              userAgent: req.get("User-Agent"),
            });
          }

          // Replace dangerous content or reject
          return obj.replace(pattern, "_SANITIZED_");
        }
      }

      // Additional string sanitization
      return validator.escape(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) =>
        sanitizeObject(item, `${path}[${index}]`)
      );
    }

    if (typeof obj === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize the key itself
        let sanitizedKey = key;
        for (const pattern of dangerousPatterns) {
          if (pattern.test(key)) {
            console.warn(
              `🚨 Dangerous key detected: ${key} from IP: ${req.ip}`
            );
            sanitizedKey = key.replace(pattern, "_SANITIZED_");
          }
        }

        sanitized[sanitizedKey] = sanitizeObject(value, `${path}.${key}`);
      }
      return sanitized;
    }

    return obj;
  };

  try {
    // Initialize security log array
    req.securityLog = req.securityLog || [];

    // Sanitize request body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body, "body");
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query, "query");
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params, "params");
    }

    next();
  } catch (error) {
    console.error("Error in NoSQL sanitizer middleware:", error);
    res.status(400).json({
      success: false,
      message: "Invalid request format",
      code: "SANITIZATION_ERROR",
    });
  }
};

// Strict mode - rejects requests with NoSQL injection patterns instead of sanitizing
const strictNoSqlProtection = (req, res, next) => {
  const dangerousPatterns = [
    /\$where/gi,
    /\$ne/gi,
    /\$nin/gi,
    /\$gt/gi,
    /\$gte/gi,
    /\$lt/gi,
    /\$lte/gi,
    /\$or/gi,
    /\$and/gi,
    /\$nor/gi,
    /\$not/gi,
    /\$exists/gi,
    /\$regex/gi,
    /javascript:/gi,
    /eval\(/gi,
  ];

  const checkForInjection = (obj, path = "") => {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === "string") {
      return dangerousPatterns.some((pattern) => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some((item, index) =>
        checkForInjection(item, `${path}[${index}]`)
      );
    }

    if (typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        if (dangerousPatterns.some((pattern) => pattern.test(key))) {
          return true;
        }
        if (checkForInjection(value, `${path}.${key}`)) {
          return true;
        }
      }
    }

    return false;
  };

  try {
    // Check body, query, and params for NoSQL injection patterns
    const hasInjection =
      checkForInjection(req.body, "body") ||
      checkForInjection(req.query, "query") ||
      checkForInjection(req.params, "params");

    if (hasInjection) {
      console.error(`🚨 NoSQL injection attempt blocked from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "Request contains invalid characters",
        code: "SECURITY_VIOLATION",
      });
    }

    next();
  } catch (error) {
    console.error("Error in strict NoSQL protection middleware:", error);
    res.status(500).json({
      success: false,
      message: "Security check failed",
      code: "SECURITY_CHECK_ERROR",
    });
  }
};

module.exports = {
  noSqlSanitizer,
  strictNoSqlProtection,
};
