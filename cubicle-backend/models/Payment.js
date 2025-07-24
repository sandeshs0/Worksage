const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  tip: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  date: { type: Date, default: Date.now },
  note: { type: String },

  // Payment method: 'manual', 'stripe', 'khalti', etc.
  method: {
    type: String,
    enum: ['manual', 'stripe', 'khalti'],
    required: true
  },

  // Status: pending, completed, failed, refunded, etc.
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },

  // For online payments
  transactionId: { type: String },
  rawGatewayResponse: { type: mongoose.Schema.Types.Mixed },

  // Relationships
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
}, { timestamps: true });

PaymentSchema.index({ invoice: 1 });
PaymentSchema.index({ project: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ client: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
