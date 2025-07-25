const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../models/Session");

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m", issuer: "worksage", audience: "worksage-users",
    });
  }
  generateRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  async createSession(userId, ipAddress, userAgent) {
    try {
      await Session.updateMany({ userId, isActive: true }, { isActive: false });
      const accessToken = this.generateAccessToken({
        userId, type: "access",
      });
      const refreshToken = this.generateRefreshToken();
      const session = new Session({
        userId,
        refreshToken,
        accessToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await session.save();
      return {
        accessToken,
        refreshToken,
        sessionId: session._id,
      };
    } catch (error) {
      throw new Error("Failed to create session");
    }
  }

  async refreshAccessToken(refreshToken, ipAddress, userAgent) {
    try {
      const session = await Session.findOne({
        refreshToken,
        isActive: true,
        expiresAt: { $gt: new Date() },
      }).populate("userId");
      if (!session) {
        throw new Error("Invalid or expired refresh token");
      }
      if (process.env.STRICT_SESSION_VALIDATION === "true") {
        if (
          session.ipAddress !== ipAddress ||
          session.userAgent !== userAgent
        ) {
          await session.updateOne({ isActive: false });
          throw new Error("Session security violation detected");
        }
      }
      // Generate new access token
      const newAccessToken = this.generateAccessToken({
        userId: session.userId._id,
        type: "access",
      });
      // Update session
      session.accessToken = newAccessToken;
      session.lastAccessedAt = new Date();
      await session.save();
      return {
        accessToken: newAccessToken,
        user: session.userId,
      };
    } catch (error) {
      throw error;
    }
  }

  async revokeSession(refreshToken) {
    try {
      await Session.updateOne(
        { refreshToken, isActive: true },
        { isActive: false }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async revokeAllUserSessions(userId) {
    try {
      await Session.updateMany({ userId, isActive: true }, { isActive: false });
      return true;
    } catch (error) {
      return false;
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: "worksage",
        audience: "worksage-users",
      });
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  // Get active sessions for user
  async getUserSessions(userId) {
    return await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).select("-refreshToken -accessToken");
  }
}

module.exports = new TokenService();