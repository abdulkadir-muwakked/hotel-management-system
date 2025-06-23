const db = require("../models");
const { RESERVATION_TYPES, PAYMENT_STATUSES } = require("../utils/constants");

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
  await reservation.update(data);
  return reservation;
};

exports.deleteReservation = async (id) => {
  const reservation = await db.Reservation.findByPk(id);
  if (!reservation) return null;
  await reservation.destroy();
  return true;
};
