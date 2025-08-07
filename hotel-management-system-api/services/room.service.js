const db = require("../models");

exports.getAllRooms = async ({ available, roomNumber, search, type }) => {
  const where = {};

  if (roomNumber) {
    where.roomNumber = roomNumber;
  }

  // فلترة فقط على Room.type بمطابقة غير حساسة لحالة الأحرف
  if (type && typeof type === "string" && type.trim() !== "") {
    // استخدم LIKE بدلاً من ILIKE إذا كنت تستخدم MySQL
    where.type = { [db.Sequelize.Op.like]: type.trim() };
  }

  if (search) {
    where[db.Sequelize.Op.or] = [
      { roomNumber: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { description: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }

  // 🔥 فلتر نوع الحجز
  // const reservationWhere = {};
  // if (type) {
  //   reservationWhere.reservationType = type;
  // }

  const include = [
    {
      model: db.Reservation,
      as: "reservations",
      required: false,
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
  const { roomNumber, capacity, description, isClean, type } = data;
  if (!roomNumber || !capacity) {
    throw new Error("roomNumber and capacity are required");
  }
  // Only include fields that exist in the Room model
  return db.Room.create({
    roomNumber,
    capacity,
    description,
    isClean: typeof isClean === "boolean" ? isClean : true, // default true
    type: type || "customer",
  });
};

exports.updateRoom = async (id, data) => {
  const room = await db.Room.findByPk(id);
  if (!room) return null;
  // Only update allowed fields
  const updateData = {};
  if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isClean !== undefined) updateData.isClean = data.isClean;
  if (data.type !== undefined) updateData.type = data.type;
  await room.update(updateData);
  return room;
};

exports.deleteRoom = async (id) => {
  const room = await db.Room.findByPk(id);
  if (!room) return null;
  await room.destroy();
  return true;
};
