// controllers/payment.controller.js
const paymentService = require("../services/payment.service");
const { paymentTransformer } = require("../utils/transformers");
const responses = require("../helper/responses");

exports.createPayment = async (req, res) => {
  try {
    const paymentData = { ...req.body, receivedBy: req.user.id };
    const payment = await paymentService.createPayment(paymentData);
    return responses.successWithMessage(
      "Payment created",
      res,
      paymentTransformer(payment)
    );
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    return responses.successWithMessage(
      "Payments fetched",
      res,
      payments.map(paymentTransformer)
    );
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return responses.failedWithMessage("Payment not found", res);
    return responses.successWithMessage(
      "Payment fetched",
      res,
      paymentTransformer(payment)
    );
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
};

exports.getPaymentsByReservation = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByReservation(
      req.params.id
    );
    return responses.successWithMessage(
      "Payments fetched",
      res,
      payments.map(paymentTransformer)
    );
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    return responses.successWithMessage(
      "Payment updated",
      res,
      paymentTransformer(payment)
    );
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await paymentService.deletePayment(req.params.id);
    return responses.successWithMessage("Payment deleted", res);
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
};
