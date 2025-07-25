require("dotenv").config();
const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const cors = require("cors");
const { apiLimiter } = require("./middleware/rateLimiter");
const cookieParser = require("cookie-parser");

const app = express();

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
};

// Connect to Database
connectDB();

const passport = require("passport");

// Passport config
require("./config/passport")(passport);

// CORS Configuration - SINGLE INSTANCE ONLY
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://localhost:3000",
        "http://localhost:3000",
        "https://localhost:5173",
        "http://localhost:5173",
        "https://127.0.0.1:3000",
        "http://127.0.0.1:3000",
        "https://127.0.0.1:5173",
        "http://127.0.0.1:5173",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.secure) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
});

// Body parsing middleware
app.use(
  express.json({
    extended: false,
    limit: "10mb", // Prevent large payload attacks
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "10mb",
  })
);
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Logging middleware for debugging
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

// Define Routes
const auth = require("./middleware/auth");

// app.use("/api", apiLimiter);

// Public Routes
app.use("/api/auth", require("./routes/auth"));

// Protected Routes (require authentication)
app.use("/api/users", auth, require("./routes/users"));
app.use("/api/profile", auth, require("./routes/profile"));
app.use("/api/clients", auth, require("./routes/clients"));
app.use("/api/emails", auth, require("./routes/emails"));
app.use("/api/email", require("./routes/testEmail"));
app.use("/api/projects", auth, require("./routes/projects"));
app.use("/api/email-accounts", auth, require("./routes/emailAccounts"));
app.use("/api/ai", auth, require("./routes/ai"));
app.use("/api/boards", auth, require("./routes/board"));
app.use("/api/columns", auth, require("./routes/column"));
app.use("/api/tasks", auth, require("./routes/task"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/notifications", auth, require("./routes/notifications"));

// Error handling middleware
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
