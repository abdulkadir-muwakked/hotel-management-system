const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const checkRole = require("../middlewares/checkRole");
const reservationController = require("../controllers/reservation.controller");
const reservationService = require("../services/reservation.service");
const { reservationTransformer } = require("../utils/transformers");
const responses = require("../helper/responses");

// All routes require authentication and admin/receptionist role
router.use(isAuth);
router.use(checkRole.isAdminOrReceptionist);

// POST   /reservations      not   → Create a new reservation
router.post("/", reservationController.createReservation);
// GET    /reservations       not  → Get all reservations
router.get("/", isAuth, async (req, res) => {
  // Reservations: filter by type, date range, user, search
  const {
    type,
    fromDate,
    toDate,
    userId,
    search,
    status,
    roomId,
    customerId,
    brokerId,
    checkInFrom,
    checkInTo,
  } = req.query;
  try {
    const reservations = await reservationService.getAllReservations({
      type,
      fromDate,
      toDate,
      userId,
      search,
      status,
      roomId,
      customerId,
      brokerId,
      checkInFrom,
      checkInTo,
    });
    return responses.successWithMessage(
      "Reservations fetched",
      res,
      reservations.map(reservationTransformer)
    );
  } catch (err) {
    return responses.failedWithMessage(err.message, res);
  }
});
// GET    /reservations/:id  not   → Get a specific reservation by ID
router.get("/:id", reservationController.getReservationById);
// PUT    /reservations/:id     → Update a reservation
router.put("/:id", reservationController.updateReservation);
// DELETE /reservations/:id     → Delete a reservation
router.delete("/:id", reservationController.deleteReservation);

module.exports = router;
