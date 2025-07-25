const PlanUpgrade = require("../models/PlanUpgrade");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const axios = require("axios");
const mongoose = require("mongoose");

// Khalti API configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://khalti.com/api/v2"
    : "https://dev.khalti.com/api/v2";

// Plan pricing configuration (in paisa - 1 NPR = 100 paisa)
const PLAN_PRICES = {
  free: 0,
  pro: 300000, // NPR 3,000 = 300,000 paisa
  vantage: 600000, // NPR 6,000 = 600,000 paisa
};

const PLAN_FEATURES = {
  free: {
    projects: 3,
    storage: "1GB",
    collaborators: 3,
    features: ["Basic project management", "Email support", "Basic templates"],
  },
  pro: {
    projects: 15,
    storage: "10GB",
    collaborators: 10,
    features: [
      "Advanced project management",
      "Priority support",
      "Advanced templates",
      "Time tracking",
      "Reports",
    ],
  },
  vantage: {
    projects: "Unlimited",
    storage: "100GB",
    collaborators: "Unlimited",
    features: [
      "Enterprise project management",
      "24/7 support",
      "Custom templates",
      "Advanced analytics",
      "API access",
      "White-label options",
    ],
  },
};

// Helper function to calculate upgrade amount
const calculateUpgradeAmount = (fromPlan, toPlan) => {
  const fromPrice = PLAN_PRICES[fromPlan] || 0;
  const toPrice = PLAN_PRICES[toPlan] || 0;

  if (toPrice <= fromPrice) {
    throw new Error("Cannot downgrade or upgrade to same plan");
  }

  return toPrice - fromPrice;
};

// Helper function to validate plan upgrade
const validatePlanUpgrade = (currentPlan, targetPlan) => {
  const validPlans = ["free", "pro", "vantage"];
  const upgradablePlans = ["pro", "vantage"];

  if (!validPlans.includes(currentPlan)) {
    throw new Error("Invalid current plan");
  }

  if (!upgradablePlans.includes(targetPlan)) {
    throw new Error("Invalid target plan");
  }

  if (currentPlan === targetPlan) {
    throw new Error("Cannot upgrade to the same plan");
  }

  // Ensure it's actually an upgrade
  if (PLAN_PRICES[targetPlan] <= PLAN_PRICES[currentPlan]) {
    throw new Error("Can only upgrade to higher tier plans");
  }

  return true;
};

// Get available plans
exports.getPlans = async (req, res) => {
  try {
    const plans = Object.keys(PLAN_PRICES).map((planName) => ({
      name: planName,
      price: PLAN_PRICES[planName],
      features: PLAN_FEATURES[planName],
      isUpgrade: planName !== "free",
    }));

    res.json({
      success: true,
      plans,
      currentPlan: req.user?.plan || "free",
    });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

// Get current user's plan details
exports.getCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("plan planExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentPlan = user.plan || "free";

    res.json({
      success: true,
      currentPlan: {
        name: currentPlan,
        price: PLAN_PRICES[currentPlan],
        features: PLAN_FEATURES[currentPlan],
        expiry: user.planExpiry || null,
        isExpired: user.planExpiry ? new Date() > user.planExpiry : false,
      },
    });
  } catch (error) {
    console.error("Get current plan error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current plan",
      error: error.message,
    });
  }
};

// Initiate plan upgrade with Khalti payment
exports.initiatePlanUpgrade = async (req, res) => {
  try {
    const { targetPlan } = req.body;
    const userId = req.user.id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentPlan = user.plan || "free";

    // Validate the plan upgrade
    try {
      validatePlanUpgrade(currentPlan, targetPlan);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    // Calculate upgrade amount
    const upgradeAmount = calculateUpgradeAmount(currentPlan, targetPlan);

    // Check for existing pending upgrade
    const existingUpgrade = await PlanUpgrade.findOne({
      userId,
      status: "pending",
    });

    if (existingUpgrade && !existingUpgrade.isExpired()) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending plan upgrade. Please complete or cancel it first.",
        existingUpgrade: {
          id: existingUpgrade._id,
          targetPlan: existingUpgrade.toPlan,
          amount: existingUpgrade.amount,
          createdAt: existingUpgrade.createdAt,
        },
      });
    }

    // Create plan upgrade record
    const purchase_order_id = PlanUpgrade.generatePurchaseOrderId();

    const planUpgrade = new PlanUpgrade({
      userId,
      fromPlan: currentPlan,
      toPlan: targetPlan,
      amount: upgradeAmount,
      purchase_order_id,
      status: "pending",
    });

    await planUpgrade.save();

    // Prepare Khalti payment payload
    const khaltiPayload = {
      return_url: `${process.env.FRONTEND_URL}/dashboard/settings/payment-callback`,
      website_url: process.env.FRONTEND_URL,
      amount: upgradeAmount, // Amount already in paisa
      purchase_order_id: purchase_order_id,
      purchase_order_name: `Worksage ${
        targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)
      } Plan Upgrade`,
      customer_info: {
        name: user.fullName || user.name || "User",
        email: user.email,
        phone: user.phone || "9800000000", // Default phone if not provided
      },
      amount_breakdown: [
        {
          label: `${
            targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)
          } Plan`,
          amount: PLAN_PRICES[targetPlan],
        },
        {
          label: `Current ${
            currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
          } Plan Credit`,
          amount: -PLAN_PRICES[currentPlan],
        },
      ].filter((item) => item.amount !== 0), // Remove zero amounts
      product_details: [
        {
          identity: `plan_${targetPlan}`,
          name: `Worksage ${
            targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)
          } Plan`,
          total_price: upgradeAmount,
          quantity: 1,
          unit_price: upgradeAmount,
        },
      ],
      merchant_username: "worksage",
      merchant_extra: JSON.stringify({
        planUpgradeId: planUpgrade._id,
        userId: userId,
        fromPlan: currentPlan,
        toPlan: targetPlan,
      }),
    };

    // Store customer info and amount breakdown in upgrade record
    planUpgrade.paymentDetails.customer_info = khaltiPayload.customer_info;
    planUpgrade.paymentDetails.amount_breakdown =
      khaltiPayload.amount_breakdown;
    await planUpgrade.save();

    try {
      // Initiate payment with Khalti
      const khaltiResponse = await axios.post(
        `${KHALTI_API_BASE}/epayment/initiate/`,
        khaltiPayload,
        {
          headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update plan upgrade with pidx
      planUpgrade.pidx = khaltiResponse.data.pidx;
      planUpgrade.paymentDetails.khalti_response = khaltiResponse.data;
      await planUpgrade.save();

      // Log the upgrade initiation
      await ActivityLog.create({
        user: userId,
        method: "POST",
        endpoint: "/api/plans/initiate-upgrade",
        status: 200,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        body: { targetPlan },
        metadata: {
          action: "plan_upgrade_initiated",
          fromPlan: currentPlan,
          toPlan: targetPlan,
          amount: upgradeAmount,
          purchase_order_id,
        },
      });

      res.status(201).json({
        success: true,
        message: "Plan upgrade initiated successfully",
        upgradeDetails: {
          id: planUpgrade._id,
          fromPlan: currentPlan,
          toPlan: targetPlan,
          amount: upgradeAmount,
          purchase_order_id,
        },
        khaltiPayment: {
          pidx: khaltiResponse.data.pidx,
          payment_url: khaltiResponse.data.payment_url,
          expires_at: khaltiResponse.data.expires_at,
          expires_in: khaltiResponse.data.expires_in,
        },
      });
    } catch (khaltiError) {
      console.error(
        "Khalti initiate payment error:",
        khaltiError.response?.data || khaltiError.message
      );

      // Update plan upgrade status to failed
      planUpgrade.status = "failed";
      planUpgrade.failureReason =
        khaltiError.response?.data?.detail || khaltiError.message;
      await planUpgrade.save();

      res.status(500).json({
        success: false,
        message: "Payment initiation failed",
        error: khaltiError.response?.data || khaltiError.message,
      });
    }
  } catch (error) {
    console.error("Initiate plan upgrade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate plan upgrade",
      error: error.message,
    });
  }
};

// Handle Khalti payment callback
exports.handleKhaltiCallback = async (req, res) => {
  try {
    const {
      pidx,
      status,
      transaction_id,
      tidx,
      amount,
      mobile,
      purchase_order_id,
      purchase_order_name,
      total_amount,
    } = req.query;

    console.log("Khalti callback received for plan upgrade:", req.query);

    // Find the plan upgrade record
    const planUpgrade = await PlanUpgrade.findOne({
      purchase_order_id: purchase_order_id,
    }).populate("userId");

    if (!planUpgrade) {
      console.error(
        "Plan upgrade not found for purchase_order_id:",
        purchase_order_id
      );
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/error?reason=upgrade_not_found`
      );
    }

    if (status === "Completed") {
      try {
        // Verify payment with Khalti lookup
        const lookupResponse = await axios.post(
          `${KHALTI_API_BASE}/epayment/lookup/`,
          { pidx: pidx },
          {
            headers: {
              Authorization: `Key ${KHALTI_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (lookupResponse.data.status === "Completed") {
          // Update plan upgrade record
          planUpgrade.status = "completed";
          planUpgrade.transaction_id = transaction_id;
          planUpgrade.tidx = tidx;
          planUpgrade.completedAt = new Date();
          planUpgrade.paymentDetails.verified_at = new Date();
          planUpgrade.paymentDetails.khalti_response = {
            ...planUpgrade.paymentDetails.khalti_response,
            lookup_response: lookupResponse.data,
          };

          // Update user's plan
          const user = await User.findById(planUpgrade.userId);
          user.plan = planUpgrade.toPlan;
          // Set plan expiry to 1 year from now (optional)
          user.planExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

          await Promise.all([planUpgrade.save(), user.save()]);

          // Log successful upgrade
          await ActivityLog.create({
            user: planUpgrade.userId,
            method: "GET",
            endpoint: "/api/plans/callback",
            status: 200,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            metadata: {
              action: "plan_upgrade_completed",
              fromPlan: planUpgrade.fromPlan,
              toPlan: planUpgrade.toPlan,
              amount: planUpgrade.amount,
              transaction_id,
              purchase_order_id,
            },
          });

          return res.redirect(
            `${process.env.FRONTEND_URL}/payment/success?type=plan_upgrade&plan=${planUpgrade.toPlan}&pidx=${pidx}`
          );
        }
      } catch (lookupError) {
        console.error("Khalti lookup error:", lookupError);
        planUpgrade.status = "failed";
        planUpgrade.failureReason = "Payment verification failed";
        await planUpgrade.save();
      }
    }

    // Handle failed or cancelled payments
    if (
      status === "User canceled" ||
      status === "Expired" ||
      status === "Failed"
    ) {
      planUpgrade.status = status === "User canceled" ? "cancelled" : "failed";
      planUpgrade.failureReason = `Payment ${status.toLowerCase()}`;
      await planUpgrade.save();

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed?type=plan_upgrade&reason=${status}&pidx=${pidx}`
      );
    }

    // Default redirect for unknown status
    res.redirect(`${process.env.FRONTEND_URL}/plans?status=${status}`);
  } catch (error) {
    console.error("Khalti callback error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/payment/error?reason=callback_error`
    );
  }
};

// Verify payment and complete plan upgrade
exports.verifyPlanUpgrade = async (req, res) => {
  try {
    const { pidx } = req.body;
    const userId = req.user.id;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "pidx is required",
      });
    }

    // Find the plan upgrade
    const planUpgrade = await PlanUpgrade.findOne({
      pidx: pidx,
      userId: userId,
    });

    if (!planUpgrade) {
      return res.status(404).json({
        success: false,
        message: "Plan upgrade not found",
      });
    }

    // Verify payment with Khalti
    const lookupResponse = await axios.post(
      `${KHALTI_API_BASE}/epayment/lookup/`,
      { pidx: pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = lookupResponse.data;

    if (
      paymentData.status === "Completed" &&
      planUpgrade.status !== "completed"
    ) {
      // Complete the upgrade
      planUpgrade.status = "completed";
      planUpgrade.transaction_id = paymentData.transaction_id;
      planUpgrade.completedAt = new Date();
      planUpgrade.paymentDetails.verified_at = new Date();
      planUpgrade.paymentDetails.khalti_response = {
        ...planUpgrade.paymentDetails.khalti_response,
        lookup_response: paymentData,
      };

      // Update user's plan
      const user = await User.findById(userId);
      user.plan = planUpgrade.toPlan;
      user.planExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await Promise.all([planUpgrade.save(), user.save()]);
    }

    res.json({
      success: true,
      message: "Payment verification completed",
      planUpgrade: {
        id: planUpgrade._id,
        status: planUpgrade.status,
        fromPlan: planUpgrade.fromPlan,
        toPlan: planUpgrade.toPlan,
        amount: planUpgrade.amount,
        completedAt: planUpgrade.completedAt,
      },
      paymentStatus: paymentData.status,
    });
  } catch (error) {
    console.error("Verify plan upgrade error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.response?.data || error.message,
    });
  }
};

// Get plan upgrade history
exports.getPlanUpgradeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const upgrades = await PlanUpgrade.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-paymentDetails.khalti_response"); // Exclude sensitive payment data

    const total = await PlanUpgrade.countDocuments(query);

    res.json({
      success: true,
      upgrades,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get plan upgrade history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan upgrade history",
      error: error.message,
    });
  }
};

// Cancel pending plan upgrade
exports.cancelPlanUpgrade = async (req, res) => {
  try {
    const { upgradeId } = req.params;
    const userId = req.user.id;

    const planUpgrade = await PlanUpgrade.findOne({
      _id: upgradeId,
      userId: userId,
      status: "pending",
    });

    if (!planUpgrade) {
      return res.status(404).json({
        success: false,
        message: "Pending plan upgrade not found",
      });
    }

    planUpgrade.status = "cancelled";
    planUpgrade.notes = "Cancelled by user";
    await planUpgrade.save();

    res.json({
      success: true,
      message: "Plan upgrade cancelled successfully",
      upgrade: {
        id: planUpgrade._id,
        status: planUpgrade.status,
      },
    });
  } catch (error) {
    console.error("Cancel plan upgrade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel plan upgrade",
      error: error.message,
    });
  }
};
