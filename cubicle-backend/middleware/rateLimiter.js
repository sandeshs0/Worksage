const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Too many requests from this IP, please try again after 15 minutes.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Too many authentication attempts from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  skipSuccessfulRequests: true,
  //   console.log("Inside authLimiter"),
  handler: (req, res) => {
    console.log("Inside authLimiter");
    res.status(429).json({
      error:
        "Too many authentication attempts from this IP, please try again after 15 minutes.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error:
      "Too many password reset attempts from this IP, please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Too many password reset attempts from this IP, please try again after 1 hour.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Too many registration attempts from this IP, please try again after 1 hour.",
    retryAfter: 60 * 60,
  },
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Too many registration attempts from this IP, please try again after 1 hour.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  registerLimiter,
};
