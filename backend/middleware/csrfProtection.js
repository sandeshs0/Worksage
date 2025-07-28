const csrf = require("csurf");

// CSRF protection using cookies
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000, // 1 ghanta
  },
});

// Custom error handler for CSRF
function csrfErrorHandler(err, req, res, next) {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
      code: "CSRF_TOKEN_INVALID",
    });
  }
  next(err);
}

module.exports = { csrfProtection, csrfErrorHandler };
