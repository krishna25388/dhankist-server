// ─── Customer Model ───────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Customer name is required"],
      trim:     true,
    },
    initials: {
      type: String,
      trim: true,
    },
    color: {
      type:    String,
      default: "#7C6FE0",
    },
    phone: {
      type: String,
      trim: true,
    },
    loanAmount: {
      type:     Number,
      required: [true, "Loan amount is required"],
      min:      [1, "Loan amount must be greater than 0"],
    },
    interest: {
      type:    Number,
      default: 20,
      min:     0,
      max:     100,
    },
    duration: {
      type:     Number,
      required: [true, "Duration is required"],
      min:      [1, "Duration must be at least 1 day"],
    },
    startDate: {
      type:     String,
      required: [true, "Start date is required"],
    },
    status: {
      type:    String,
      enum:    ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,  // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);