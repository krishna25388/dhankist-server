// ─── Auth Routes ──────────────────────────────────────────────────────────────
const express = require("express");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const router  = express.Router();

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Login with mobile + PIN
router.post("/login", async (req, res) => {
  try {
    const { mobile, pin } = req.body;

    // ── Validate input ──
    if (!mobile || !pin) {
      return res.status(400).json({
        success: false,
        error:   "Mobile number and PIN are required",
      });
    }

    if (pin.length !== 4) {
      return res.status(400).json({
        success: false,
        error:   "PIN must be 4 digits",
      });
    }

    // ── Find user by mobile ──
    const user = await User.findOne({ mobile, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        error:   "Mobile number not registered",
      });
    }

    // ── Check PIN ──
    const isMatch = await user.matchPIN(pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error:   "Incorrect PIN. Please try again",
      });
    }

    // ── Generate JWT token — expires in 7 days ──
    const token = jwt.sign(
      {
        id:     user._id,
        name:   user.name,
        mobile: user.mobile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ── Return token + user info ──
    res.json({
      success: true,
      token,
      user: {
        id:     user._id,
        name:   user.name,
        mobile: user.mobile,
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ─── GET /api/auth/verify ─────────────────────────────────────────────────────
// Verify token is still valid
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    res.json({
      success: true,
      user: {
        id:     user._id,
        name:   user.name,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, error: "Token expired or invalid" });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Logout — client just deletes token
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;