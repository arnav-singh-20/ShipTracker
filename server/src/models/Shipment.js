const mongoose = require('mongoose');

const STATUS_VALUES = ['Pending', 'In Transit', 'Customs', 'Delivered'];

// Embedded subdocument schema for a single timeline entry.
// We deliberately do NOT disable _id here (Mongoose adds one automatically
// to every subdocument) - the frontend needs a stable id per entry so it
// can target a specific one for edit/delete, e.g.
// PATCH /api/shipments/:id/history/:historyId
const statusUpdateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: STATUS_VALUES,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Who made this change - useful for an audit trail even though we allow
    // edits/deletes; keeps a record of which admin touched the timeline.
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // The customer this shipment belongs to. This single field is what makes
    // role-based access possible: every "customer can only see their own
    // shipments" query is just `Shipment.find({ owner: req.user._id })`.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    carrier: {
      type: String,
      required: [true, 'Carrier is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'Pending',
    },
    estimatedDelivery: {
      type: Date,
    },
    // Embedded, not a separate collection - see the design note discussed
    // with the team: a shipment's timeline is always read alongside the
    // shipment itself (detail page = one query), never queried independently
    // across shipments, so embedding avoids an unnecessary populate()/join.
    statusHistory: [statusUpdateSchema],
  },
  { timestamps: true } // createdAt acts as "date created", updatedAt as "last updated"
);

// Auto-generate a human-readable tracking ID if the client didn't supply one,
// e.g. "ST-2026-4F8A2C". Runs before validation so the `required: true` /
// `unique: true` checks above still apply to the generated value.
shipmentSchema.pre('validate', function (next) {
  if (!this.trackingId) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.trackingId = `ST-${year}-${random}`;
  }
  next();
});

// Index on owner: every customer-scoped list query filters by this field,
// so it should be indexed rather than scanning the whole collection.
shipmentSchema.index({ owner: 1 });
// Index on status: dashboard filtering/summary counts ("in-transit count")
// query by status frequently.
shipmentSchema.index({ status: 1 });

shipmentSchema.statics.STATUS_VALUES = STATUS_VALUES;

module.exports = mongoose.model('Shipment', shipmentSchema);
