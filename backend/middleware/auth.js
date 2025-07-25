const { authenticateToken } = require("./authMiddleware");

// For backward compatibility, export the enhanced auth middleware
module.exports = authenticateToken;
