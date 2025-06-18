const db = require("../models");

exports.getAllRooms = async () => {
  return db.Room.findAll();
};

exports.getRoomById = async (id) => {
  return db.Room.findByPk(id);
};

exports.createRoom = async (data) => {
  const { roomNumber, capacity, price, description } = data;
  if (!roomNumber || !capacity || !price) {
    throw new Error("roomNumber, capacity, and price are required");
  }
  return db.Room.create({ roomNumber, capacity, price, description });
};

exports.updateRoom = async (id, data) => {
  const room = await db.Room.findByPk(id);
  if (!room) return null;
  await room.update(data);
  return room;
};

exports.deleteRoom = async (id) => {
  const room = await db.Room.findByPk(id);
  if (!room) return null;
  await room.destroy();
  return true;
};