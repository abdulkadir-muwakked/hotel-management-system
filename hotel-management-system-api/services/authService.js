// src/services/authService.js
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.isActive) throw new Error("User is inactive");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Invalid password");

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    },
  };
}

module.exports = { login };
