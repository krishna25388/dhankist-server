// ─── Collection Routes ────────────────────────────────────────────────────────
const express    = require("express");
const router     = express.Router();
const Collection = require("../models/Collection");

// ─── GET /api/collections ─────────────────────────────────────────────────────
// Get all collections (optional filter by date)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.date)       filter.date       = req.query.date;
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.status)     filter.status     = req.query.status;

    const collections = await Collection
      .find(filter)
      .populate("customerId", "name initials color phone loanAmount interest duration startDate status")
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/collections/customer/:customerId ────────────────────────────────
// Get all collections for one customer
router.get("/customer/:customerId", async (req, res) => {
  try {
    const collections = await Collection
      .find({ customerId: req.params.customerId })
      .sort({ date: -1 });

    res.json({ success: true, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/collections/date/:date ─────────────────────────────────────────
// Get all collections for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const collections = await Collection
      .find({ date: req.params.date })
      .populate("customerId", "name initials color phone loanAmount interest duration startDate status")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/collections/summary/today ──────────────────────────────────────
// Get today's summary — total collected, missed, pending
router.get("/summary/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const collections = await Collection
      .find({ date: today })
      .populate("customerId", "name initials color loanAmount interest duration");

    const totalCollected = collections
      .filter((c) => c.status === "Paid")
      .reduce((s, c) => s + c.amount, 0);

    const totalMissed = collections
      .filter((c) => c.status === "Missed").length;

    res.json({
      success: true,
      data: {
        date:           today,
        totalCollected,
        totalMissed,
        collections,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/collections ────────────────────────────────────────────────────
// Add new collection record
router.post("/", async (req, res) => {
  try {
    // Check if collection already exists for this customer on this date
    const existing = await Collection.findOne({
      customerId: req.body.customerId,
      date:       req.body.date,
    });

    if (existing) {
      // Merge — add on top of existing (double payment support)
      existing.emis   += Number(req.body.emis   || 0);
      existing.amount += Number(req.body.amount  || 0);
      existing.status  = req.body.amount > 0 ? "Paid" : existing.status;
      if (req.body.notes)       existing.notes       = req.body.notes;
      if (req.body.paymentMode) existing.paymentMode = req.body.paymentMode;
      await existing.save();
      return res.json({ success: true, data: existing, merged: true });
    }

    // Create new collection
    const collection = await Collection.create(req.body);
    res.status(201).json({ success: true, data: collection, merged: false });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/collections/:id ─────────────────────────────────────────────────
// Update a collection record
router.put("/:id", async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!collection) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }
    res.json({ success: true, data: collection });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/collections/:id ─────────────────────────────────────────────
// Delete a collection record
router.delete("/:id", async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }
    res.json({ success: true, message: "Collection deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;