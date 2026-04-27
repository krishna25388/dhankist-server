// ─── Customer Routes ──────────────────────────────────────────────────────────
const express  = require("express");
const router   = express.Router();
const Customer = require("../models/Customer");

// ─── GET /api/customers ───────────────────────────────────────────────────────
// Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/customers/:id ───────────────────────────────────────────────────
// Get single customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/customers ──────────────────────────────────────────────────────
// Create new customer
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/customers/:id ───────────────────────────────────────────────────
// Update customer
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/customers/:id/status ─────────────────────────────────────────
// Update customer status only (Active / Completed)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/customers/:id ────────────────────────────────────────────────
// Delete customer and all their collections
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    // Also delete all collections for this customer
    const Collection = require("../models/Collection");
    await Collection.deleteMany({ customerId: req.params.id });

    res.json({ success: true, message: "Customer and all collections deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;