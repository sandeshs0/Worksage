const axios = require("axios");

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!token) return false;
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret,
          response: token,
        },
      }
    );
    return response.data.success;
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    return false;
  }
}

module.exports = verifyRecaptcha;
