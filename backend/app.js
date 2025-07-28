require("dotenv").config();
const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const { noSqlSanitizer } = require("./middleware/noSqlSanitizer");
const { xssProtection } = require("./middleware/xssProtection");

const app = express();
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
};

connectDB();
const passport = require("passport");
require("./config/passport")(passport);
app.use(
  cors({
    origin: ["https://localhost:5173", "https://accounts.google.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
      "Accept",
      "Origin",
    ],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com",
        ],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: { action: "deny" },
    xssFilter: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(xssProtection);

app.use(
  express.json({
    extended: false,
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.use(cookieParser());

// NoSQL injection prevention
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(
        `⚠️ NoSQL injection attempt detected and sanitized: ${key} from ${req.ip}`
      );
    },
  })
);

app.use(noSqlSanitizer);

app.use((req, res, next) => {
  req.securityLog = [];
  next();
});

app.use(passport.initialize());

const activityLogger = require("./middleware/activityLogger");
app.use(activityLogger);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("origin")}`);
  next();
});

app.get("/", (req, res) =>
  res.json({
    message: "API Running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  })
);

const auth = require("./middleware/auth");

// app.use("/api", apiLimiter);

const {
  csrfProtection,
  csrfErrorHandler,
} = require("./middleware/csrfProtection");

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  });
});

app.use(
  "/api/auth",
  (req, res, next) => {
    if (req.path === "/google/callback" && req.url.includes("code=")) {
      console.log("🔧 Preserving original OAuth query parameters");

      const rawUrl = req.url;
      const codeMatch = rawUrl.match(/code=([^&]+)/);
      if (codeMatch) {
        const rawCode = decodeURIComponent(codeMatch[1]);
        console.log("📝 Raw OAuth code:", rawCode.substring(0, 20) + "...");

        req.rawOAuthCode = rawCode;
      }
    }

    if (req.path === "/google" || req.path === "/google/callback") {
      console.log(`🔓 Skipping CSRF for OAuth route: ${req.path}`);
      return next();
    }

    console.log(`🔒 Applying CSRF for auth route: ${req.path}`);
    csrfProtection(req, res, next);
  },
  csrfErrorHandler,
  require("./routes/auth")
);

app.use(
  "/api/users",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/users")
);
app.use(
  "/api/profile",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/profile")
);
app.use(
  "/api/clients",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/clients")
);
app.use(
  "/api/emails",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/emails")
);
app.use(
  "/api/email",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/testEmail")
);
app.use(
  "/api/projects",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/projects")
);
app.use(
  "/api/email-accounts",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/emailAccounts")
);
app.use("/api/mfa", require("./routes/mfa"));
app.use(
  "/api/ai",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/ai")
);
app.use(
  "/api/boards",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/board")
);
app.use("/api/security", require("./routes/security"));

app.get("/api/plans/callback", require("./routes/plans"));

app.use(
  "/api/plans",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/plans")
);

app.use(
  "/api/columns",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/column")
);
app.use(
  "/api/tasks",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/task")
);
app.use(
  "/api/invoices",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/invoices")
);
app.use(
  "/api/notifications",
  auth,
  csrfProtection,
  csrfErrorHandler,
  require("./routes/notifications")
);

app.use(
  "/api/admin",
  csrfProtection,
  csrfErrorHandler,
  require("./middleware/authMiddleware").authenticateToken,
  require("./middleware/authMiddleware").requireAdmin,
  require("./routes/admin")
);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      origin: req.get("origin"),
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const httpsServer = https.createServer(options, app);

httpsServer.listen(PORT, () => {
  console.log(`🔒 Secure server running on https://localhost:${PORT}`);
  console.log(`📡 CORS enabled for multiple origins`);
});

httpsServer.on("error", (err) => {
  console.error("❌ HTTPS Server Error:", err);
});

module.exports = app;
