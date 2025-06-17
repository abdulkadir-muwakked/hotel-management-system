require("dotenv").config();
const bcrypt = require("bcryptjs");
const { User, sequelize } = require("../models");

async function createAdmin() {
  try {
    await sequelize.sync(); // تأكد من توافر الجداول
    const hashed = await bcrypt.hash("1234", 10);

    // Check if admin exists
    let admin = await User.findOne({ where: { email: "admin@example.com" } });
    if (admin) {
      // Update password and activate
      admin.passwordHash = hashed;
      admin.isActive = true;
      admin.username = "admin";
      admin.role = "admin";
      await admin.save();
      console.log("✅ Admin updated:", admin.email);
    } else {
      admin = await User.create({
        username: "admin",
        email: "admin@example.com",
        passwordHash: hashed,
        role: "admin",
        isActive: true,
      });
      console.log("✅ Admin created:", admin.email);
    }
  } catch (err) {
    console.error("❌ Failed to create/update admin:", err);
  } finally {
    process.exit();
  }
}

createAdmin();
