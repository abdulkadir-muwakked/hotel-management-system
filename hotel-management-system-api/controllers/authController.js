// src/controllers/authController.js
const authService = require("../services/authService");

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { login };
