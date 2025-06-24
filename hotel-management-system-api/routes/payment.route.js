// routes/payment.route.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const isAuth = require("../middlewares/isAuth");
const { isAdminOrReceptionist } = require("../middlewares/checkRole");

// POST /payments
router.post(
  "/",
  isAuth,
  isAdminOrReceptionist,
  paymentController.createPayment
);
// GET /payments
router.get(
  "/",
  isAuth,
  isAdminOrReceptionist,
  paymentController.getAllPayments
);
// GET /payments/:id
router.get(
  "/:id",
  isAuth,
  isAdminOrReceptionist,
  paymentController.getPaymentById
);
// GET payments/reservations/:id/
router.get(
  "/reservations/:id",
  isAuth,
  isAdminOrReceptionist,
  paymentController.getPaymentsByReservation
);
// PUT /payments/:id
router.put(
  "/:id",
  isAuth,
  isAdminOrReceptionist,
  paymentController.updatePayment
);
// DELETE /payments/:id
router.delete(
  "/:id",
  isAuth,
  isAdminOrReceptionist,
  paymentController.deletePayment
);

module.exports = router;
