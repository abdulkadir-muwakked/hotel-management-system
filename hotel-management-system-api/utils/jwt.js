// src/utils/jwt.js
const jwt = require("jsonwebtoken");

function sign(data, expiresIn = "1d") {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { sign, verify };
