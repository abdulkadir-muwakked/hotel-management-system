// src/services/user.service.js
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const VALID_ROLES = [
  "admin",
  "receptionist",
  "broker",
  "customer",
  "student",
  "doctor",
];

const createUser = async ({
  username,
  email,
  password,
  phone,
  role,
  nationalId,
  address,
  notes,
}) => {
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.User.create({
    username,
    email,
    passwordHash,
    phone,
    role,
    nationalId,
    address,
    isActive: true,
    notes,
  });

  return user;
};

const getUser = async ({ userId: id }) => {
  try {
    const user = await db.User.findOne({
      where: { id },
      //   include: [
      //     {
      //       model: db.Payment,
      //       as: "receivedPayments",
      //     },
      //     {
      //       model: db.Reservation,
      //       as: "createdReservations",
      //     },
      //     {
      //       model: db.Reservation,
      //       as: "brokerReservations",
      //     },
      //     {
      //       model: db.Reservation,
      //       as: "reservations",
      //       through: { attributes: [] },
      //     },
      //   ],
    });
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const getAllUsers = async ({ role }) => {
  const where = {};
  if (role && role !== "all") {
    if (!VALID_ROLES.includes(role)) {
      const error = new Error("Invalid role filter");
      error.status = 400;
      throw error;
    }
    where.role = role;
  }
  return db.User.findAll({ where });
};

module.exports = { getUser, createUser, getAllUsers };
