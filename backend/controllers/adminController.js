const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const mongoose = require("mongoose");


exports.getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    
    const filter = {};
    if (req.query.method) filter.method = req.query.method;
    if (req.query.endpoint)
      filter.endpoint = { $regex: req.query.endpoint, $options: "i" };
    if (req.query.status) filter.status = parseInt(req.query.status);
    if (req.query.from || req.query.to) {
      filter.timestamp = {};
      if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
      if (req.query.to) filter.timestamp.$lte = new Date(req.query.to);
    }
    
    if (req.query.user && /^[a-fA-F0-9]{24}$/.test(req.query.user.trim())) {
      filter.user = mongoose.Types.ObjectId(req.query.user.trim());
    }

    
    const total = await ActivityLog.countDocuments(filter);

    
    const logs = await ActivityLog.find(filter)
      .populate("user", "_id name email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    
    const uniqueUsers = await ActivityLog.distinct("user", filter);
    const topEndpoints = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: "$endpoint", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const topMethods = await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: "$method", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      logs,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      total,
      insights: {
        totalRequests: total,
        uniqueUsers: uniqueUsers.length,
        topEndpoints,
        topMethods,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
};


exports.clearActivityLogs = async (req, res) => {
  try {
    const filter = {};

    
    if (req.body.olderThan) {
      filter.timestamp = { $lt: new Date(req.body.olderThan) };
    }

    const result = await ActivityLog.deleteMany(filter);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} activity logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear activity logs",
      error: error.message,
    });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};


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


exports.getSecurityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    
    const filter = {
      $or: [{ isSecurityEvent: true }, { type: "security" }],
    };

    
    if (req.query.eventType) {
      filter.$or.push(
        { "securityEvents.type": req.query.eventType },
        { action: req.query.eventType }
      );
    }
    if (req.query.ip) {
      filter.$or.push(
        { ip: { $regex: req.query.ip, $options: "i" } },
        { ipAddress: { $regex: req.query.ip, $options: "i" } }
      );
    }
    if (req.query.from || req.query.to) {
      filter.timestamp = {};
      if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
      if (req.query.to) filter.timestamp.$lte = new Date(req.query.to);
    }
    if (req.query.user && /^[a-fA-F0-9]{24}$/.test(req.query.user.trim())) {
      filter.user = mongoose.Types.ObjectId(req.query.user.trim());
    }

    
    const total = await ActivityLog.countDocuments(filter);

    
    const logs = await ActivityLog.find(filter)
      .populate("user", "_id fullName email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    
    const securityStats = await ActivityLog.aggregate([
      {
        $match: {
          $or: [{ isSecurityEvent: true }, { type: "security" }],
        },
      },
      {
        $addFields: {
          eventType: {
            $cond: {
              if: { $eq: ["$type", "security"] },
              then: "$action",
              else: {
                $cond: {
                  if: { $isArray: "$securityEvents" },
                  then: { $arrayElemAt: ["$securityEvents.type", 0] },
                  else: "unknown",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
          latestIncident: { $max: "$timestamp" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    
    const xssStats = await ActivityLog.aggregate([
      {
        $match: {
          type: "security",
          action: "xss_attempt",
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          count: { $sum: 1 },
          uniqueIPs: { $addToSet: "$ipAddress" },
        },
      },
      { $sort: { "_id.date": -1, "_id.hour": -1 } },
      { $limit: 24 },
    ]);

    const topThreats = await ActivityLog.aggregate([
      {
        $match: {
          $or: [{ isSecurityEvent: true }, { type: "security" }],
        },
      },
      {
        $addFields: {
          threatIP: {
            $cond: {
              if: { $ne: ["$ipAddress", null] },
              then: "$ipAddress",
              else: "$ip",
            },
          },
        },
      },
      {
        $group: {
          _id: "$threatIP",
          count: { $sum: 1 },
          latestAttempt: { $max: "$timestamp" },
          threatTypes: { $addToSet: "$action" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const recentThreats = await ActivityLog.find({
      $or: [{ isSecurityEvent: true }, { type: "security" }],
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    
    const criticalThreats = await ActivityLog.countDocuments({
      $or: [{ isSecurityEvent: true }, { type: "security" }],
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, 
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total,
          limit,
        },
        insights: {
          securityStats,
          xssStats,
          topThreats,
          recentThreats,
          criticalThreats,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching security logs:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch security logs" });
  }
};


exports.getSecurityDashboard = async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    
    const threats24h = await ActivityLog.countDocuments({
      $or: [{ isSecurityEvent: true }, { type: "security" }],
      timestamp: { $gte: last24h },
    });

    const threats7d = await ActivityLog.countDocuments({
      $or: [{ isSecurityEvent: true }, { type: "security" }],
      timestamp: { $gte: last7d },
    });

    const totalThreats = await ActivityLog.countDocuments({
      $or: [{ isSecurityEvent: true }, { type: "security" }],
    });

    
    const xssAttempts24h = await ActivityLog.countDocuments({
      $or: [
        { "securityEvents.type": "XSS_ATTEMPT" },
        { type: "security", action: "xss_attempt" },
      ],
      timestamp: { $gte: last24h },
    });

    const xssAttempts7d = await ActivityLog.countDocuments({
      $or: [
        { "securityEvents.type": "XSS_ATTEMPT" },
        { type: "security", action: "xss_attempt" },
      ],
      timestamp: { $gte: last7d },
    });

    const noSqlAttempts24h = await ActivityLog.countDocuments({
      $or: [
        { "securityEvents.type": "NoSQL_INJECTION_ATTEMPT" },
        { "securityEvents.type": "NOSQL_INJECTION_ATTEMPT" },
        { type: "security", action: "nosql_injection_attempt" },
      ],
      timestamp: { $gte: last24h },
    });

    const noSqlAttempts7d = await ActivityLog.countDocuments({
      $or: [
        { "securityEvents.type": "NoSQL_INJECTION_ATTEMPT" },
        { "securityEvents.type": "NOSQL_INJECTION_ATTEMPT" },
        { type: "security", action: "nosql_injection_attempt" },
      ],
      timestamp: { $gte: last7d },
    });

    
    const threatBreakdown = await ActivityLog.aggregate([
      {
        $match: {
          $or: [{ isSecurityEvent: true }, { type: "security" }],
          timestamp: { $gte: last7d },
        },
      },
      {
        $addFields: {
          threatType: {
            $cond: {
              if: { $eq: ["$type", "security"] },
              then: "$action",
              else: {
                $cond: {
                  if: { $isArray: "$securityEvents" },
                  then: { $arrayElemAt: ["$securityEvents.type", 0] },
                  else: "unknown",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$threatType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    
    const topAttackers = await ActivityLog.aggregate([
      {
        $match: {
          $or: [{ isSecurityEvent: true }, { type: "security" }],
          timestamp: { $gte: last7d },
        },
      },
      {
        $addFields: {
          attackerIP: {
            $cond: {
              if: { $ne: ["$ipAddress", null] },
              then: "$ipAddress",
              else: "$ip",
            },
          },
          threatType: {
            $cond: {
              if: { $eq: ["$type", "security"] },
              then: "$action",
              else: {
                $cond: {
                  if: { $isArray: "$securityEvents" },
                  then: { $arrayElemAt: ["$securityEvents.type", 0] },
                  else: "unknown",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$attackerIP",
          attempts: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
          threatTypes: { $addToSet: "$threatType" },
          xssAttempts: {
            $sum: {
              $cond: [{ $eq: ["$action", "xss_attempt"] }, 1, 0],
            },
          },
          noSqlAttempts: {
            $sum: {
              $cond: [{ $eq: ["$action", "nosql_injection_attempt"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 5 },
    ]);

    
    const threatTimeline = await ActivityLog.aggregate([
      { $match: { isSecurityEvent: true, timestamp: { $gte: last7d } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          threats24h,
          threats7d,
          totalThreats,
          xssAttempts24h,
          xssAttempts7d,
          noSqlAttempts24h,
          noSqlAttempts7d,
        },
        threatBreakdown,
        topAttackers,
        threatTimeline,
      },
    });
  } catch (error) {
    console.error("Error fetching security dashboard:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch security dashboard" });
  }
};
