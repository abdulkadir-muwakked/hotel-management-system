const db = require("../models");

exports.getAllRooms = async () => {
  return db.Room.findAll({
    include: [
      {
        model: db.Reservation,
        as: "reservations",
        include: [
          {
            model: db.User,
            as: "createdByUser",
            include: [{ model: db.Document, as: "documents" }],
          },
          {
            model: db.User,
            as: "broker",
            include: [{ model: db.Document, as: "documents" }],
          },
          {
            model: db.User,
            as: "customers",
            through: { attributes: [] },
            include: [{ model: db.Document, as: "documents" }],
          },
        ],
      },
    ],
  });
};

exports.getRoomById = async (id) => {
  return db.Room.findByPk(id, {
    include: [
      {
        model: db.Reservation,
        as: "reservations",
        include: [
          {
            model: db.User,
            as: "createdByUser",
            include: [{ model: db.Document, as: "documents" }],
          },
          {
            model: db.User,
            as: "broker",
            include: [{ model: db.Document, as: "documents" }],
          },
          {
            model: db.User,
            as: "customers",
            through: { attributes: [] },
            include: [{ model: db.Document, as: "documents" }],
          },
        ],
      },
    ],
  });
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
