const validator = require("validator");

// XSS Protection Middleware
const xssProtection = async (req, res, next) => {
  console.log(`🛡️ XSS Protection: Processing ${req.method} ${req.path}`);
  
  // Skip XSS protection for OAuth endpoints (they contain legitimate auth codes)
  const oauthExemptions = ["/api/auth/google", "/api/auth/google/callback"];


  // Skip XSS protection for endpoints that allow HTML (invoices, emails, etc)
  const htmlExemptions = ["/api/invoices", "/api/projects", "/api/tasks", "/api/emails"];

  // Check if this is an OAuth endpoint
  const isOAuthEndpoint = oauthExemptions.some(
    (exemption) => req.path === exemption || req.path.startsWith(exemption)
  );


  // Check if this is an endpoint that should be exempted from XSS blocking
  const isHtmlExemptEndpoint = htmlExemptions.some((exemption) =>
    req.path.startsWith(exemption)
  );


  // Skip XSS protection for OAuth and HTML-exempt endpoints
  if (isOAuthEndpoint) {
    console.log(`🔓 XSS protection bypassed for OAuth endpoint: ${req.path}`);
    return next();
  }

  if (isHtmlExemptEndpoint) {
    console.log(`⚠️ XSS protection bypassed for HTML-exempt endpoint: ${req.path}`);
    return next();
  }

  // XSS patterns to detect (simplified and more comprehensive)
  const xssPatterns = [
    /<script[\s\S]*?>/gi,                // Any script tag opening
    /<\/script>/gi,                      // Script closing tag
    /<iframe[\s\S]*?>/gi,                // Any iframe tag opening
    /<\/iframe>/gi,                      // Iframe closing tag
    /javascript\s*:/gi,                  // JavaScript protocol
    /vbscript\s*:/gi,                    // VBScript protocol
    /data\s*:\s*text\/html/gi,           // Data URL with HTML
    /on\w+\s*=/gi,                       // Event handlers (onclick, onload, etc.)
    /eval\s*\(/gi,                       // eval() function
    /expression\s*\(/gi,                 // CSS expression()
    /document\s*\./gi,                   // Document access
    /window\s*\./gi,                     // Window access
    /alert\s*\(/gi,                      // Alert function
    /confirm\s*\(/gi,                    // Confirm function
    /prompt\s*\(/gi,                     // Prompt function
    /<object[\s\S]*?>/gi,                // Object tag
    /<embed[\s\S]*?>/gi,                 // Embed tag
    /<applet[\s\S]*?>/gi,                // Applet tag
    /<meta[\s\S]*?>/gi,                  // Meta tag
    /<link[\s\S]*?>/gi,                  // Link tag
    /<style[\s\S]*?>/gi,                 // Style tag opening
    /<\/style>/gi,                       // Style tag closing
    /&lt;script/gi,                      // HTML encoded script
    /&gt;/gi,                           // HTML encoded >
    /&#x3c;script/gi,                    // Hex encoded script
    /\x3cscript/gi,                      // Hex encoded script
  ];

  // Track XSS attempts
  let xssAttempts = [];
  let foundMaliciousContent = false;

  // Function to check for XSS patterns (detection only)
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

    console.log(`🔍 Checking for XSS in ${path}: "${obj.substring(0, 100)}"`);

    // Check for XSS patterns
    for (const pattern of xssPatterns) {
      if (pattern.test(obj)) {
        foundMaliciousContent = true;

        // Log XSS attempt
        console.log(
          `🚨 XSS DETECTED! Pattern: ${pattern} matched in ${path}: ${obj.substring(
            0,
            50
          )}... from IP: ${req.ip}`
        );

        // Record the attempt
        xssAttempts.push({
          field: path,
          content: obj.substring(0, 200),
          pattern: pattern.toString(),
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          timestamp: new Date(),
        });

        // Add to security log
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
        
        // Stop checking other patterns for this field
        break;
      }
    }
  };

  // Function to sanitize objects (after detection)
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

    // Sanitize the string by escaping HTML entities
    return validator.escape(obj);
  };

  try {
    // Initialize security log array if it doesn't exist
    req.securityLog = req.securityLog || [];

    // First, detect XSS in all input without sanitizing
    if (req.body && typeof req.body === "object") {
      detectXSS(req.body, "body");
    }
    if (req.query && typeof req.query === "object") {
      detectXSS(req.query, "query");
    }
    if (req.params && typeof req.params === "object") {
      detectXSS(req.params, "params");
    }

    // Block request if malicious content was found
    if (foundMaliciousContent) {
      // Log security event
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
          securityEvents: xssAttempts.map(attempt => ({
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

    // If no XSS found, sanitize the input as a precaution
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

// Strict XSS protection - rejects requests with XSS instead of sanitizing
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
    // Check body, query, and params for XSS patterns
    const hasXSS =
      checkForXSS(req.body, "body") ||
      checkForXSS(req.query, "query") ||
      checkForXSS(req.params, "params");

    if (hasXSS) {
      console.error(`🚨 XSS attempt blocked from IP: ${req.ip}`);

      // Log the attempt
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

// Output sanitization for API responses
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
      // Don't sanitize certain safe fields
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
