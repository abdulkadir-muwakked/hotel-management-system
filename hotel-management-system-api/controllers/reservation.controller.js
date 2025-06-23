const response = require("../helper/responses");
const reservationService = require("../services/reservation.service");
const transformers = require("../utils/transformers");

exports.createReservation = async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.id,
    };

    const reservation = await reservationService.createReservation(data);

    return response.successWithMessage(
      "Reservation created successfully",
      res,
      {
        reservation: transformers.reservationTransformer(reservation),
      }
    );
  } catch (err) {
    return response.failedWithMessage(
      err.message || "Failed to create reservation",
      res
    );
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await reservationService.getAllReservations();
    return response.successWithMessage(
      "Reservations fetched successfully",
      res,
      {
        reservations: reservations.map(transformers.reservationTransformer),
      }
    );
  } catch (err) {
    return response.serverError(res);
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(
      req.params.id
    );
    if (!reservation)
      return response.failedWithMessage("Reservation not found", res);
    return response.successWithMessage(
      "Reservation fetched successfully",
      res,
      {
        reservation: transformers.reservationTransformer(reservation),
      }
    );
  } catch (err) {
    return response.serverError(res);
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const reservation = await reservationService.updateReservation(
      req.params.id,
      req.body
    );
    if (!reservation)
      return response.failedWithMessage("Reservation not found", res);
    return response.successWithMessage(
      "Reservation updated successfully",
      res,
      {
        reservation: transformers.reservationTransformer(reservation),
      }
    );
  } catch (err) {
    return response.failedWithMessage(
      err.message || "Failed to update reservation",
      res
    );
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const deleted = await reservationService.deleteReservation(req.params.id);
    if (!deleted)
      return response.failedWithMessage("Reservation not found", res);
    return response.successWithMessage("Reservation deleted successfully", res);
  } catch (err) {
    return response.failedWithMessage(
      err.message || "Failed to delete reservation",
      res
    );
  }
};
