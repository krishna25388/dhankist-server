// ─── User Model ───────────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },
    mobile: {
      type:      String,
      required:  [true, "Mobile number is required"],
      unique:    true,
      trim:      true,
      minlength: [10, "Mobile must be 10 digits"],
      maxlength: [10, "Mobile must be 10 digits"],
    },
    pin: {
      type:     String,
      required: [true, "PIN is required"],
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash PIN before saving ───────────────────────────────────────────────────
UserSchema.pre("save", async function (next) {
  // Only hash if PIN was changed
  if (!this.isModified("pin")) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin   = await bcrypt.hash(this.pin, salt);
  next();
});

// ─── Compare entered PIN with stored hashed PIN ───────────────────────────────
UserSchema.methods.matchPIN = async function (enteredPIN) {
  return await bcrypt.compare(enteredPIN, this.pin);
};

module.exports = mongoose.model("User", UserSchema);