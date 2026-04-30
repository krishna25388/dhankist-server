// ─── Customer Routes ──────────────────────────────────────────────────────────
const express  = require("express");
const router   = express.Router();
const Customer = require("../models/Customer");

// ─── GET /api/customers ───────────────────────────────────────────────────────
// Get all customers — excludes Deleted ones
router.get("/", async (req, res) => {
  try {
    const customers = await Customer
      .find({ status: { $ne: "Deleted" } })
      .sort({ createdAt: -1 });
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
router.post("/", async (req, res) => {
  try {
    const payload = {
      name:               req.body.name,
      initials:           req.body.initials,
      color:              req.body.color,
      phone:              req.body.phone        || "",
      loanAmount:         Number(req.body.loanAmount),
      remainingPrincipal: Number(req.body.loanAmount),
      interest:           Number(req.body.interest  || 5),
      duration:           Number(req.body.duration  || 12),
      startDate:          req.body.startDate,
      frequency:          req.body.frequency    || "monthly",
      paymentType:        req.body.paymentType  || "reducing_balance",
      status:             "Active",
    };

    console.log("📌 Creating customer:", payload);

    const customer = await Customer.create(payload);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    console.error("❌ Create customer error:", err.message);
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
// Update customer status — Active / Completed / Deleted
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

// ─── PATCH /api/customers/:id/principal ──────────────────────────────────────
// Update remaining principal after principal payment
router.patch("/:id/principal", async (req, res) => {
  try {
    const { principalPaid } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    // Reduce remaining principal
    const newPrincipal = Math.max(0, customer.remainingPrincipal - principalPaid);
    customer.remainingPrincipal = newPrincipal;

    // Auto complete if fully paid
    if (newPrincipal === 0) {
      customer.status = "Completed";
    }

    await customer.save();
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/customers/:id/delete ─────────────────────────────────────────
// Soft delete — sets status to Deleted
// Data stays in DB forever — just hidden from app
router.patch("/:id/delete", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        status: "Deleted",
        deletedAt: new Date(),
        deletedBy: req.user?.mobile || "unknown",
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    res.json({
      success: true,
      message: `${customer.name} has been deleted. Data is safe in database.`,
      data:    customer,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PATCH /api/customers/:id/restore ────────────────────────────────────────
// Restore a soft deleted customer
router.patch("/:id/restore", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status: "Active" },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer restored successfully", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;