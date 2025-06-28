const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ تأكد من المسار المطلق للمجلد 'uploads'
const uploadsPath = path.resolve(__dirname, "uploads");
console.log("🚀 Serving static files from:", uploadsPath);

// ✅ ملفات الرفع من مجلد uploads
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api", routes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

module.exports = app;
