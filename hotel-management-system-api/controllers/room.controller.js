const response = require("../helper/responses");
const roomService = require("../services/room.service");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    return response.successWithMessage("Rooms fetched successfully", res, { rooms });
  } catch (err) {
    return response.serverError(res);
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) return response.failedWithMessage("Room not found", res);
    return response.successWithMessage("Room fetched successfully", res, { room });
  } catch (err) {
    return response.serverError(res);
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await roomService.createRoom(req.body);
    return response.successWithMessage("Room created successfully", res, { room });
  } catch (err) {
    return response.failedWithMessage(err.message || "Failed to create room", res);
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    if (!room) return response.failedWithMessage("Room not found", res);
    return response.successWithMessage("Room updated successfully", res, { room });
  } catch (err) {
    return response.failedWithMessage(err.message || "Failed to update room", res);
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const deleted = await roomService.deleteRoom(req.params.id);
    if (!deleted) return response.failedWithMessage("Room not found", res);
    return response.successWithMessage("Room deleted successfully", res);
  } catch (err) {
    return response.failedWithMessage(err.message || "Failed to delete room", res);
  }
};