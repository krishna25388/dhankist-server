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

    // ─── Loan Details ───────────────────────────────────────────────────────
    loanAmount: {
      type:     Number,
      required: [true, "Loan amount is required"],
      min:      [1, "Loan amount must be greater than 0"],
    },
    remainingPrincipal: {
      type: Number,
      default: 0,
      // Starts equal to loanAmount — reduces as principal is paid
    },
    interest: {
      type:    Number,
      default: 20,
      min:     0,
      max:     100,
    },

    // ─── Loan Type ──────────────────────────────────────────────────────────
    // daily   → fixed EMI every day
    // weekly  → payment every 7 days
    // monthly → payment every 30 days
    frequency: {
      type:    String,
      enum:    ["daily", "weekly", "monthly"],
      default: "daily",
    },

    // ─── Payment Type ────────────────────────────────────────────────────────
    // fixed_emi        → same amount every period
    // interest_only    → only interest paid each period, principal at end
    // reducing_balance → interest + extra principal reduces loan
    paymentType: {
      type:    String,
      enum:    ["fixed_emi", "interest_only", "reducing_balance"],
      default: "fixed_emi",
    },

    duration: {
      type:     Number,
      required: [true, "Duration is required"],
      min:      [1, "Duration must be at least 1"],
    },
    startDate: {
      type:     String,
      required: [true, "Start date is required"],
    },

    // ─── Status ──────────────────────────────────────────────────────────────
    // Active   → currently active loan
    // Completed→ loan fully paid
    // Deleted  → soft deleted — hidden from app but safe in DB
    status: {
      type:    String,
      enum:    ["Active", "Completed", "Deleted"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto set remainingPrincipal = loanAmount on create ───────────────────────
// CustomerSchema.pre("save", function (next) {
//   if (this.isNew && !this.remainingPrincipal) {
//     this.remainingPrincipal = this.loanAmount;
//   }
//   next();
// });

module.exports = mongoose.model("Customer", CustomerSchema);