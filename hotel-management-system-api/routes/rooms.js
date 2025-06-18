const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const checkRole = require("../middlewares/checkRole");
const roomController = require("../controllers/room.controller");

// All routes require authentication
router.use(isAuth);

// GET /rooms - all users
router.get("/", roomController.getAllRooms);
// GET /rooms/:id - all users
router.get("/:id", roomController.getRoomById);
// POST /rooms - admin or receptionist only
router.post("/", checkRole.isAdminOrReceptionist, roomController.createRoom);
// PUT /rooms/:id - admin or receptionist only
router.put("/:id", checkRole.isAdminOrReceptionist, roomController.updateRoom);
// DELETE /rooms/:id - admin or receptionist only
router.delete("/:id", checkRole.isAdminOrReceptionist, roomController.deleteRoom);

module.exports = router;