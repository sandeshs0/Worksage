const User = require("../models/User");

// List all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Change user plan
exports.changeUserPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan } = req.body;
    const allowedPlans = ["free", "pro", "vantage"];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { plan },
      { new: true }
    ).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change plan" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// System statistics
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const admins = await User.countDocuments({ isAdmin: true });
    res.json({ success: true, stats: { totalUsers, activeUsers, admins } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// Placeholder for activity logs (to be implemented)
exports.getActivityLogs = async (req, res) => {
  res.json({ success: true, logs: [] });
};
