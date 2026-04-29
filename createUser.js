// ─── Run this once to create your first user ──────────────────────────────────
// Command: node createUser.js
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("./models/User");

async function createUser() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ── Change these details to your own ──
  const users = [
    { name: "Admin",  mobile: "7906128339", pin: "4503" },
    { name: "Staff1", mobile: "6005299159", pin: "4503" },
  ];

  for (const u of users) {
    const exists = await User.findOne({ mobile: u.mobile });
    if (exists) {
      console.log(`⚠️  User ${u.mobile} already exists — skipping`);
      continue;
    }
    await User.create(u);
    console.log(`✅ Created user: ${u.name} — ${u.mobile}`);
  }

  mongoose.disconnect();
  console.log("✅ Done!");
}

createUser().catch(console.error);