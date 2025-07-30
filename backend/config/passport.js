const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        //console.log(" Google OAuth strategy callback:");
        //console.log("Access Token:", accessToken ? " Present" : " Missing");
        //console.log("Profile ID:", profile?.id);
        //console.log("Profile Email:", profile?.emails?.[0]?.value);

        const newUserInfo = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          isVerified: true,
          profileImage: profile.photos ? profile.photos[0].value : null,
        };
        try {
          let user = await User.findOne({ googleId: profile.id });
          let isNewUser = false;

          if (user) {
          } else {
            user = await User.findOne({ email: newUserInfo.email });
            if (user) {
              user.googleId = newUserInfo.googleId;
              user.isVerified = true;
              await user.save();
            } else {
              user = await User.create(newUserInfo);
              isNewUser = true;
            }
          }
          const userPayload = user.toObject();
          userPayload.isNewUser = isNewUser;

          return done(null, userPayload);
        } catch (err) {
          console.error("❌ Google OAuth Strategy Error:", err);
          if (err.message && err.message.includes("Malformed auth code")) {
            console.error("🔧 Possible solutions:");
            console.error("1. Check Google OAuth credentials");
            console.error("2. Verify redirect URI in Google Console");
            console.error("3. Check if domain is authorized");
          }
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
