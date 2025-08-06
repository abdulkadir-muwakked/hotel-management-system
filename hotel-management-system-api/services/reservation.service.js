const db = require("../models");
const { RESERVATION_TYPES, PAYMENT_STATUSES } = require("../utils/constants");

async function validateReservationData(data, reservationId = null) {
  const { roomId, reservationType, checkIn, checkOut, paymentStatus } = data;

  // تحقق من حالة الدفع إذا أُرسلت
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  // تحقق من الحقول الأساسية
  if (!roomId || !reservationType || !checkIn || !checkOut) {
    throw new Error(
      "Missing required fields: roomId, reservationType, checkIn, checkOut"
    );
  }

  // تحقق من أن checkOut بعد checkIn
  if (new Date(checkOut) <= new Date(checkIn)) {
    throw new Error("Check-out date must be after check-in date");
  }

  // تحقق من أن الغرفة موجودة
  const room = await db.Room.findByPk(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  // تحقق من عدم وجود حجز متداخل لنفس الغرفة (تجاهل الحجز الحالي عند التعديل)
  // Adjusted for 2-hour buffer: checkout at 12:00, checkin at 14:00
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(14, 0, 0, 0); // 2:00 PM
  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(12, 0, 0, 0); // 12:00 PM

  // جلب نوع الغرفة
  const roomType = room.type;

  if (roomType === "customer") {
    // لا يسمح بحجزين متداخلين لنفس الشقة لنوع customer
    const where = {
      roomId,
      [db.Sequelize.Op.or]: [
        {
          checkIn: { [db.Sequelize.Op.lt]: checkOutDate },
          checkOut: { [db.Sequelize.Op.gt]: checkInDate },
        },
      ],
    };
    if (reservationId) {
      where.id = { [db.Sequelize.Op.ne]: reservationId };
    }
    const overlapping = await db.Reservation.findOne({ where });
    if (overlapping) {
      throw new Error(
        "Room is not available for the selected date range (buffer window applies)"
      );
    }
  } else {
    // إذا كانت الشقة من نوع طالب أو دكتور، تحقق فقط من السعة
    // احسب عدد الحجوزات المتداخلة في نفس الفترة
    const where = {
      roomId,
      [db.Sequelize.Op.or]: [
        {
          checkIn: { [db.Sequelize.Op.lt]: checkOutDate },
          checkOut: { [db.Sequelize.Op.gt]: checkInDate },
        },
      ],
    };
    if (reservationId) {
      where.id = { [db.Sequelize.Op.ne]: reservationId };
    }
    const overlappingCount = await db.Reservation.count({ where });
    if (overlappingCount >= room.capacity) {
      throw new Error(
        "Room capacity is full for the selected date range (buffer window applies)"
      );
    }
  }
}

exports.createReservation = async (data) => {
  const {
    roomId,
    createdBy,
    brokerId,
    reservationType,
    checkIn,
    checkOut,
    price,
    priceUnit,
    brokerCommissionPercent,
    brokerCommissionAmount,
    customerDetails,
    paymentStatus,
    notes,
    customerIds = [],
  } = data;

  await validateReservationData({
    roomId,
    reservationType,
    checkIn,
    checkOut,
    paymentStatus,
  });

  // إنشاء الحجز
  const reservation = await db.Reservation.create({
    roomId,
    createdBy,
    brokerId: brokerId || null,
    reservationType,
    checkIn,
    checkOut,
    price,
    priceUnit,
    brokerCommissionPercent,
    brokerCommissionAmount,
    customerDetails,
    paymentStatus: paymentStatus || "pending",
    notes: notes || null,
  });

  // ربط الزبائن إذا أُرسلت
  if (Array.isArray(customerIds) && customerIds.length > 0) {
    await reservation.setCustomers(customerIds);
  }

  // Fetch and return the reservation with all associations
  return db.Reservation.findByPk(reservation.id, {
    include: [
      {
        model: db.User,
        as: "customers",
        attributes: ["id", "username", "email", "phone"],
        through: { attributes: [] },
        include: [{ model: db.Document, as: "documents" }],
      },
      {
        model: db.Room,
        as: "room",
        attributes: ["id", "roomNumber", "capacity", "description", "isClean"],
      },
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
        model: db.Payment,
        as: "payments",
      },
    ],
  });
};

exports.getAllReservations = async (filters = {}) => {
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
  } = filters;
  const where = {};
  if (type && type !== "all") {
    where.reservationType = type;
  }
  if (status && status !== "all") {
    where.paymentStatus = status;
  }
  if (roomId) {
    where.roomId = roomId;
  }
  if (fromDate && toDate) {
    where.checkIn = { [db.Sequelize.Op.gte]: fromDate };
    where.checkOut = { [db.Sequelize.Op.lte]: toDate };
  }
  if (checkInFrom) {
    where.checkIn = {
      ...(where.checkIn || {}),
      [db.Sequelize.Op.gte]: checkInFrom,
    };
  }
  if (checkInTo) {
    where.checkIn = {
      ...(where.checkIn || {}),
      [db.Sequelize.Op.lte]: checkInTo,
    };
  }
  if (search) {
    where.notes = { [db.Sequelize.Op.iLike]: `%${search}%` };
  }
  // Associated users
  let include = [
    {
      model: db.User,
      as: "customers",
      attributes: ["id", "username", "email", "phone"],
      through: { attributes: [] },
      where: customerId ? { id: customerId } : undefined,
      required: !!customerId,
      include: [{ model: db.Document, as: "documents" }],
    },
    {
      model: db.Room,
      as: "room",
      attributes: ["id", "roomNumber", "capacity", "description"], // removed 'price'
    },
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
      model: db.Payment,
      as: "payments",
    },
  ];
  if (brokerId) {
    include.push({
      model: db.User,
      as: "broker",
      where: { id: brokerId },
      required: true,
      include: [{ model: db.Document, as: "documents" }],
    });
  }
  if (userId) {
    where[db.Sequelize.Op.or] = [{ createdBy: userId }, { brokerId: userId }];
  }
  return db.Reservation.findAll({ where, include });
};

exports.getReservationById = async (id) => {
  return db.Reservation.findByPk(
    id,

    {
      include: [
        {
          model: db.User,
          as: "customers",
          attributes: ["id", "username", "email", "phone"],
          through: { attributes: [] }, // حتى ما يرجعلك جدول الوسيط
        },
      ],
    }
  );
};

exports.updateReservation = async (id, data) => {
  const reservation = await db.Reservation.findByPk(id);
  if (!reservation) return null;
  await validateReservationData(
    {
      roomId: data.roomId ?? reservation.roomId,
      reservationType: data.reservationType ?? reservation.reservationType,
      checkIn: data.checkIn ?? reservation.checkIn,
      checkOut: data.checkOut ?? reservation.checkOut,
      paymentStatus: data.paymentStatus ?? reservation.paymentStatus,
    },
    id
  );
  await reservation.update(data);
  return reservation;
};

exports.deleteReservation = async (id) => {
  const reservation = await db.Reservation.findByPk(id);
  if (!reservation) return null;
  await reservation.destroy();
  return true;
};
