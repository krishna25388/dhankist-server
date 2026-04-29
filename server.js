// // ─── DhanKist Express Server ──────────────────────────────────────────────────
// const express    = require("express");
// const mongoose   = require("mongoose");
// const cors       = require("cors");
// const dotenv     = require("dotenv");

// // ─── Load environment variables ───────────────────────────────────────────────
// dotenv.config();

// // ─── Initialize Express ───────────────────────────────────────────────────────
// const app  = express();
// const PORT = process.env.PORT || 5000;

// // ─── Middleware ───────────────────────────────────────────────────────────────
// // app.use(cors({
// //   origin:      process.env.CLIENT_URL || "http://localhost:3000",
// //   credentials: true,
// //   methods:     ["GET", "POST", "PUT", "PATCH", "DELETE"],
// // }));
// // Replace the cors section with this
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ─── Routes ───────────────────────────────────────────────────────────────────
// app.use("/api/customers",   require("./routes/customers"));
// app.use("/api/collections", require("./routes/collections"));

// // ─── Health check ─────────────────────────────────────────────────────────────
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "✅ DhanKist API is running",
//     version: "1.0.0",
//     endpoints: {
//       customers:   "/api/customers",
//       collections: "/api/collections",
//     },
//   });
// });

// // ─── 404 Handler ─────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error:   "Route not found",
//   });
// });

// // ─── Global error handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error("❌ Server Error:", err.message);
//   res.status(500).json({
//     success: false,
//     error:   err.message || "Internal server error",
//   });
// });

// // ─── Connect to MongoDB Atlas then start server ───────────────────────────────
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB Atlas connected — dhankist database ready");
//     // app.listen(PORT, () => {
//     //   console.log(`✅ DhanKist server running on http://localhost:${PORT}`);
//     // });
//     app.listen(PORT, "0.0.0.0", () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed:", err.message);
//     process.exit(1);
//   });

// ─── DhanKist Express Server ──────────────────────────────────────────────────
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");

// ─── Load environment variables ───────────────────────────────────────────────
dotenv.config();

// ─── Initialize Express ───────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin:  "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Middleware — Protect all routes except auth ──────────────────────────────
const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error:   "Not authorized — please login",
      });
    }
    const decoded  = jwt.verify(token, process.env.JWT_SECRET);
    req.user       = decoded;

    // ── Track who made the request ──
    console.log(`📌 [${new Date().toLocaleString("en-IN")}] ${req.method} ${req.path} — by ${decoded.name} (${decoded.mobile})`);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error:   "Token expired — please login again",
    });
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public — no token needed
app.use("/api/auth", require("./routes/auth"));

// Protected — token required
app.use("/api/customers",   protect, require("./routes/customers"));
app.use("/api/collections", protect, require("./routes/collections"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ DhanKist API is running",
    version: "1.0.0",
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   "Route not found",
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    success: false,
    error:   err.message || "Internal server error",
  });
});

// ─── Connect MongoDB then start server ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected — dhankist database ready");
    app.listen(PORT, () => {
      console.log(`✅ DhanKist server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });