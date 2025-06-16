// app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// const bodyParser = require('body-parser'); // لو express قديم
const routes = require("./routes"); // رح نعمل مجلد routes لاحقًا

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json()); // بديل bodyParser.json()
app.use(express.urlencoded({ extended: true })); // لتحليل الفورمات العادية

// Routes
app.use("/api", routes);

// Error handler (بسيط)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

module.exports = app;
