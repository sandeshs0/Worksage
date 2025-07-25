const validator = require("validator");

const xssProtection = async (req, res, next) => {
  console.log(`XSS Protection: Processing ${req.method} ${req.path}`);

  const oauthExemptions = ["/api/auth/google", "/api/auth/google/callback"];

  const htmlExemptions = [
    "/api/invoices",
    "/api/projects",
    "/api/tasks",
    "/api/emails",
  ];

  const isOAuthEndpoint = oauthExemptions.some(
    (exemption) => req.path === exemption || req.path.startsWith(exemption)
  );

  const isHtmlExemptEndpoint = htmlExemptions.some((exemption) =>
    req.path.startsWith(exemption)
  );

  if (isOAuthEndpoint) {
    console.log(`🔓 XSS protection bypassed for OAuth endpoint: ${req.path}`);
    return next();
  }

  if (isHtmlExemptEndpoint) {
    console.log(
      `⚠️ XSS protection bypassed for HTML-exempt endpoint: ${req.path}`
    );
    return next();
  }

  const xssPatterns = [
    /<script[\s\S]*?>/gi, 
    /<\/script>/gi, 
    /<iframe[\s\S]*?>/gi, 
    /<\/iframe>/gi, 
    /javascript\s*:/gi, 
    /vbscript\s*:/gi, 
    /data\s*:\s*text\/html/gi, 
    /on\w+\s*=/gi, 
    /eval\s*\(/gi, 
    /expression\s*\(/gi, 
    /document\s*\./gi, 
    /window\s*\./gi, 
    /alert\s*\(/gi, 
    /confirm\s*\(/gi, 
    /prompt\s*\(/gi, 
    /<object[\s\S]*?>/gi, 
    /<embed[\s\S]*?>/gi, 
    /<applet[\s\S]*?>/gi, 
    /<meta[\s\S]*?>/gi, 
    /<link[\s\S]*?>/gi, 
    /<style[\s\S]*?>/gi, 
    /<\/style>/gi, 
    /&lt;script/gi, 
    /&gt;/gi, 
    /&#x3c;script/gi, 
    /\x3cscript/gi, 
  ];
  let xssAttempts = [];
  let foundMaliciousContent = false;
  const detectXSS = (obj, path = "") => {
    if (typeof obj !== "string") {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => detectXSS(item, `${path}[${index}]`));
        return;
      }
      if (obj && typeof obj === "object") {
        for (const [key, value] of Object.entries(obj)) {
          detectXSS(value, `${path}.${key}`);
        }
      }
      return;
    }

    console.log(` Checking for XSS in ${path}: "${obj.substring(0, 100)}"`);

    
    for (const pattern of xssPatterns) {
      if (pattern.test(obj)) {
        foundMaliciousContent = true;

        
        console.log(
          ` XSS DETECTED! Pattern: ${pattern} matched in ${path}: ${obj.substring(
            0,
            50
          )}... from IP: ${req.ip}`
        );

        
        xssAttempts.push({
          field: path,
          content: obj.substring(0, 200),
          pattern: pattern.toString(),
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          timestamp: new Date(),
        });

        
        if (req.securityLog) {
          req.securityLog.push({
            type: "XSS_ATTEMPT",
            path: path,
            value: obj.substring(0, 200),
            timestamp: new Date(),
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          });
        }

        
        break;
      }
    }
  };

  
  const sanitizeXSS = (obj, path = "") => {
    if (typeof obj !== "string") {
      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeXSS(item, `${path}[${index}]`));
      }

      if (obj && typeof obj === "object") {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeXSS(value, `${path}.${key}`);
        }
        return sanitized;
      }

      return obj;
    }

    
    return validator.escape(obj);
  };

  try {
    
    req.securityLog = req.securityLog || [];

    
    if (req.body && typeof req.body === "object") {
      detectXSS(req.body, "body");
    }
    if (req.query && typeof req.query === "object") {
      detectXSS(req.query, "query");
    }
    if (req.params && typeof req.params === "object") {
      detectXSS(req.params, "params");
    }

    
    if (foundMaliciousContent) {
      
      const ActivityLog = require("../models/ActivityLog");
      try {
        await ActivityLog.create({
          type: "security",
          action: "xss_attempt",
          userId: req.user ? req.user.id : null,
          ip: req.ip || req.connection.remoteAddress || "unknown",
          endpoint: `${req.method} ${req.url}`,
          userAgent: req.get("User-Agent"),
          url: req.url,
          method: req.method,
          details: `XSS attempt blocked. Found ${xssAttempts.length} malicious patterns.`,
          severity: "high",
          timestamp: new Date(),
          metadata: {
            attempts: xssAttempts,
            blocked: true,
          },
          isSecurityEvent: true,
          securityEvents: xssAttempts.map((attempt) => ({
            type: "XSS_ATTEMPT",
            path: attempt.field,
            value: attempt.content,
            timestamp: attempt.timestamp,
            ip: attempt.ip,
            userAgent: attempt.userAgent,
          })),
        });
      } catch (logError) {
        console.error("Failed to log XSS attempt:", logError);
      }

      return res.status(400).json({
        success: false,
        message:
          "Request contains potentially malicious content and has been blocked.",
        code: "XSS_ATTEMPT_BLOCKED",
        securityIncident: true,
      });
    }

    
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeXSS(req.body, "body");
    }
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeXSS(req.query, "query");
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeXSS(req.params, "params");
    }

    next();
  } catch (error) {
    console.error("Error in XSS protection middleware:", error);
    res.status(400).json({
      success: false,
      message: "Invalid request format",
      code: "XSS_SANITIZATION_ERROR",
    });
  }
};


const strictXSSProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  const checkForXSS = (obj, path = "") => {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === "string") {
      return xssPatterns.some((pattern) => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some((item, index) => checkForXSS(item, `${path}[${index}]`));
    }

    if (typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        if (checkForXSS(value, `${path}.${key}`)) {
          return true;
        }
      }
    }

    return false;
  };

  try {
    
    const hasXSS =
      checkForXSS(req.body, "body") ||
      checkForXSS(req.query, "query") ||
      checkForXSS(req.params, "params");

    if (hasXSS) {
      console.error(` XSS attempt blocked from IP: ${req.ip}`);

      
      if (req.securityLog) {
        req.securityLog.push({
          type: "XSS_ATTEMPT",
          path: "request",
          value: "XSS patterns detected",
          timestamp: new Date(),
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });
      }

      return res.status(400).json({
        success: false,
        message: "Request contains potentially malicious content",
        code: "XSS_BLOCKED",
      });
    }

    next();
  } catch (error) {
    console.error("Error in strict XSS protection middleware:", error);
    res.status(500).json({
      success: false,
      message: "Security check failed",
      code: "XSS_CHECK_ERROR",
    });
  }
};


const sanitizeOutput = (data) => {
  if (typeof data === "string") {
    return validator.escape(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeOutput(item));
  }

  if (typeof data === "object" && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      
      if (["_id", "id", "createdAt", "updatedAt", "timestamp"].includes(key)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeOutput(value);
      }
    }
    return sanitized;
  }

  return data;
};

module.exports = {
  xssProtection,
  strictXSSProtection,
  sanitizeOutput,
};
