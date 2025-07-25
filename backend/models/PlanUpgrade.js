const mongoose = require('mongoose');

const PlanUpgradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromPlan: {
    type: String,
    enum: ['free', 'pro', 'vantage'],
    required: true
  },
  toPlan: {
    type: String,
    enum: ['pro', 'vantage'],
    required: true
  },
  amount: {
    type: Number,
    required: true // Amount in NPR
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Khalti payment details
  pidx: {
    type: String,
    unique: true,
    sparse: true // Allows null values but enforces uniqueness when not null
  },
  purchase_order_id: {
    type: String,
    unique: true
  },
  transaction_id: String,
  tidx: String,
  
  // Upgrade details
  upgradeDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  validUntil: Date, // Plan expiry date (optional)
  
  // Payment metadata
  paymentDetails: {
    khalti_response: mongoose.Schema.Types.Mixed,
    verified_at: Date,
    payment_method: {
      type: String,
      default: 'khalti'
    },
    amount_breakdown: mongoose.Schema.Types.Mixed,
    customer_info: mongoose.Schema.Types.Mixed
  },
  
  // Additional info
  notes: String,
  failureReason: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
PlanUpgradeSchema.index({ userId: 1, status: 1 });
PlanUpgradeSchema.index({ pidx: 1 });
PlanUpgradeSchema.index({ purchase_order_id: 1 });
PlanUpgradeSchema.index({ createdAt: -1 });

// Virtual for upgrade duration
PlanUpgradeSchema.virtual('upgradeDuration').get(function() {
  if (this.completedAt && this.upgradeDate) {
    return this.completedAt - this.upgradeDate;
  }
  return null;
});

// Static method to generate unique purchase order ID
PlanUpgradeSchema.statics.generatePurchaseOrderId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `WS${timestamp}${random}`.toUpperCase();
};

// Instance method to check if upgrade is expired
PlanUpgradeSchema.methods.isExpired = function() {
  if (this.status === 'pending' && this.createdAt) {
    const expireTime = new Date(this.createdAt.getTime() + (30 * 60 * 1000)); // 30 minutes
    return new Date() > expireTime;
  }
  return false;
};

// Pre-save middleware to update expired pending upgrades
PlanUpgradeSchema.pre('find', function() {
  // Update expired pending upgrades
  this.updateMany(
    {
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) }
    },
    { $set: { status: 'expired' } }
  );
});

module.exports = mongoose.model('PlanUpgrade', PlanUpgradeSchema);
