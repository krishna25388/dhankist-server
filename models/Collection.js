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
    emis: {
      type:    Number,
      default: 1,
      min:     0,
    },
    amount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    status: {
      type:    String,
      enum:    ["Paid", "Missed"],
      default: "Paid",
    },
    paymentMode: {
      type:    String,
      enum:    ["Cash", "UPI", "Bank Transfer"],
      default: "Cash",
    },
    notes: {
      type:    String,
      default: "",
      trim:    true,
    },
  },
  {
    timestamps: true,  // adds createdAt and updatedAt automatically
  }
);

// ─── Index for fast queries ───────────────────────────────────────────────────
// Fetch all collections of a customer quickly
CollectionSchema.index({ customerId: 1 });

// Fetch collections by date quickly
CollectionSchema.index({ date: 1 });

// Prevent duplicate entry for same customer on same date
CollectionSchema.index({ customerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Collection", CollectionSchema);