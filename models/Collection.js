// ─── Collection Model ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema(
  {
    customerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Customer",
      required: [true, "Customer ID is required"],
    },
    date: {
      type:     String,
      required: [true, "Collection date is required"],
    },

    // ─── Payment breakdown ────────────────────────────────────────────────────
    // Total amount received from customer
    amount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // Interest portion of payment
    // For reducing_balance: calculated on remainingPrincipal
    interestPaid: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // Principal portion of payment
    // For reducing_balance: reduces loan amount
    principalPaid: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // Remaining principal AFTER this payment
    // Tracked per collection for history
    remainingPrincipal: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // ─── EMI tracking ─────────────────────────────────────────────────────────
    emis: {
      type:    Number,
      default: 1,
      min:     0,
    },

    // ─── Status ───────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["Paid", "Missed", "Partial"],
      default: "Paid",
    },

    // ─── Payment mode ─────────────────────────────────────────────────────────
    paymentMode: {
      type:    String,
      enum:    ["Cash", "UPI", "Bank Transfer"],
      default: "Cash",
    },

    // ─── Notes ────────────────────────────────────────────────────────────────
    notes: {
      type:    String,
      default: "",
      trim:    true,
    },

    // ─── Recorded by ──────────────────────────────────────────────────────────
    // Tracks which user added this collection
    recordedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for fast queries ─────────────────────────────────────────────────
CollectionSchema.index({ customerId: 1 });
CollectionSchema.index({ date: 1 });
CollectionSchema.index({ customerId: 1, date: 1 });

module.exports = mongoose.model("Collection", CollectionSchema);