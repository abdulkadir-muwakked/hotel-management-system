// services/payment.service.js
const { Payment, Reservation, User } = require("../models");
const { Op } = require("sequelize");

async function validatePaymentInput(data) {
  const requiredFields = [
    "reservationId",
    "amount",
    "paymentDate",
    "paymentMethod",
    "receivedBy",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  if (!["cash", "card", "transfer", "other"].includes(data.paymentMethod)) {
    return "Invalid payment method";
  }
  if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
    return "Amount must be a positive number";
  }
  // Optionally: check if reservation exists
  const reservation = await Reservation.findByPk(data.reservationId);
  if (!reservation) return "Reservation not found";
  // Optionally: check if user exists
  const user = await User.findByPk(data.receivedBy);
  if (!user) return "User (receivedBy) not found";
  return null;
}

async function createPayment(data) {
  const error = await validatePaymentInput(data);
  if (error) throw new Error(error);
  return Payment.create(data);
}

async function getAllPayments() {
  return Payment.findAll({ include: ["reservation", "receivedByUser"] });
}

async function getPaymentById(id) {
  return Payment.findByPk(id, { include: ["reservation", "receivedByUser"] });
}

async function getPaymentsByReservation(reservationId) {
  return Payment.findAll({
    where: { reservationId },
    include: ["reservation", "receivedByUser"],
  });
}

async function updatePayment(id, data) {
  const payment = await Payment.findByPk(id);
  if (!payment) throw new Error("Payment not found");
  if (data.reservationId || data.receivedBy) {
    // Validate reservation and user if changed
    if (data.reservationId) {
      const reservation = await Reservation.findByPk(data.reservationId);
      if (!reservation) throw new Error("Reservation not found");
    }
    if (data.receivedBy) {
      const user = await User.findByPk(data.receivedBy);
      if (!user) throw new Error("User (receivedBy) not found");
    }
  }
  await payment.update(data);
  return Payment.findByPk(id, { include: ["reservation", "receivedByUser"] });
}

async function deletePayment(id) {
  const payment = await Payment.findByPk(id);
  if (!payment) throw new Error("Payment not found");
  await payment.destroy();
  return true;
}

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByReservation,
  updatePayment,
  deletePayment,
};
