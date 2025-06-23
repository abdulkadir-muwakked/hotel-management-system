const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const checkRole = require("../middlewares/checkRole");
const reservationController = require("../controllers/reservation.controller");

// All routes require authentication and admin/receptionist role
router.use(isAuth);
router.use(checkRole.isAdminOrReceptionist);

// POST   /reservations      not   → Create a new reservation
router.post("/", reservationController.createReservation);
// GET    /reservations       not  → Get all reservations
router.get("/", reservationController.getAllReservations);
// GET    /reservations/:id  not   → Get a specific reservation by ID
router.get("/:id", reservationController.getReservationById);
// PUT    /reservations/:id     → Update a reservation
router.put("/:id", reservationController.updateReservation);
// DELETE /reservations/:id     → Delete a reservation
router.delete("/:id", reservationController.deleteReservation);

module.exports = router;
