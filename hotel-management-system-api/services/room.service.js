const db = require("../models");

exports.getAllRooms = async ({ available, roomNumber, search, type }) => {
  const where = {};

  if (roomNumber) {
    where.roomNumber = roomNumber;
  }

  if (search) {
    where[db.Sequelize.Op.or] = [
      { roomNumber: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { description: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }

  // 🔥 فلتر نوع الحجز
  const reservationWhere = {};
  if (type) {
    reservationWhere.reservationType = type;
  }

  const include = [
    {
      model: db.Reservation,
      as: "reservations",
      where: Object.keys(reservationWhere).length
        ? reservationWhere
        : undefined,
      required: !!type, // ← هون السر
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
  ];

  let rooms = await db.Room.findAll({ where, include });

  // 🔄 تصفية حسب الحالة الحالية
  if (available === "empty" || available === "true") {
    rooms = rooms.filter(
      (room) =>
        !room.reservations ||
        room.reservations.every((res) => new Date(res.checkOut) < new Date())
    );
  } else if (available === "occupied" || available === "false") {
    rooms = rooms.filter(
      (room) =>
        room.reservations &&
        room.reservations.some(
          (res) =>
            new Date(res.checkIn) <= new Date() &&
            new Date(res.checkOut) >= new Date()
        )
    );
  } else if (available === "clean") {
    rooms = rooms.filter((room) => room.isClean === true);
  } else if (available === "dirty") {
    rooms = rooms.filter((room) => room.isClean === false);
  }

  return rooms;
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
