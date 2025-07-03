const db = require("../models");
const { RESERVATION_TYPES, PAYMENT_STATUSES } = require("../utils/constants");

async function validateReservationData(data, reservationId = null) {
  const {
    roomId,
    reservationType,
    checkIn,
    checkOut,
    paidAmount,
    paymentStatus,
  } = data;

  // تحقق من حالة الدفع إذا أُرسلت
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  // تحقق من الحقول الأساسية
  if (!roomId || !reservationType || !checkIn || !checkOut || !paidAmount) {
    throw new Error(
      "Missing required fields: roomId, reservationType, checkIn, checkOut, paidAmount"
    );
  }

  // تحقق من أن checkOut بعد checkIn
  if (new Date(checkOut) <= new Date(checkIn)) {
    throw new Error("Check-out date must be after check-in date");
  }

  // تحقق من أن paidAmount رقم موجب
  if (isNaN(Number(paidAmount)) || Number(paidAmount) <= 0) {
    throw new Error("paidAmount must be a positive number");
  }

  // تحقق من أن الغرفة موجودة
  const room = await db.Room.findByPk(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  // تحقق من عدم وجود حجز متداخل لنفس الغرفة (تجاهل الحجز الحالي عند التعديل)
  const where = {
    roomId,
    [db.Sequelize.Op.or]: [
      { checkIn: { [db.Sequelize.Op.between]: [checkIn, checkOut] } },
      { checkOut: { [db.Sequelize.Op.between]: [checkIn, checkOut] } },
      {
        checkIn: { [db.Sequelize.Op.lte]: checkIn },
        checkOut: { [db.Sequelize.Op.gte]: checkOut },
      },
    ],
  };
  if (reservationId) {
    where.id = { [db.Sequelize.Op.ne]: reservationId };
  }
  const overlapping = await db.Reservation.findOne({ where });
  if (overlapping) {
    throw new Error("Room is not available for the selected date range");
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
    paidAmount,
    paymentStatus,
    notes,
    customerIds = [],
  } = data;

  await validateReservationData({
    roomId,
    reservationType,
    checkIn,
    checkOut,
    paidAmount,
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
    paidAmount,
    paymentStatus: paymentStatus || "pending",
    notes: notes || null,
  });

  // ربط الزبائن إذا أُرسلت
  if (Array.isArray(customerIds) && customerIds.length > 0) {
    await reservation.setCustomers(customerIds);
  }

  return reservation;
};

exports.getAllReservations = async () => {
  return db.Reservation.findAll({
    include: [
      {
        model: db.User,
        as: "customers",
        attributes: ["id", "username", "email", "phone"],
        through: { attributes: [] }, // حتى ما يرجعلك جدول الوسيط
      },
      {
        model: db.Room,
        as: "room",
        attributes: ["id", "roomNumber", "capacity", "price", "description"],
      },
    ],
  });
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
  await validateReservationData({
    roomId: data.roomId ?? reservation.roomId,
    reservationType: data.reservationType ?? reservation.reservationType,
    checkIn: data.checkIn ?? reservation.checkIn,
    checkOut: data.checkOut ?? reservation.checkOut,
    paidAmount: data.paidAmount ?? reservation.paidAmount,
    paymentStatus: data.paymentStatus ?? reservation.paymentStatus,
  }, id);
  await reservation.update(data);
  return reservation;
};

exports.deleteReservation = async (id) => {
  const reservation = await db.Reservation.findByPk(id);
  if (!reservation) return null;
  await reservation.destroy();
  return true;
};
