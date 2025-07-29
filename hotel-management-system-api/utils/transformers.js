// utils/transformers.js
function avatarTransformer(avatar) {
  if (!avatar) return null;
  // Always use the relative filePath for the URL, stripping any absolute path
  let url = null;
  if (avatar.filePath) {
    // If filePath is absolute, extract only the part after '/uploads/'
    const match = avatar.filePath.match(/uploads\/avatars\/[^\\/]+$/i);
    url = match ? `/uploads/avatars/${avatar.fileName}` : null;
  }
  return {
    id: avatar.id,
    url,
    fileName: avatar.fileName,
    uploadedAt: avatar.createdAt,
  };
}

function documentTransformer(document) {
  if (!document) return null;
  return {
    id: document.id,
    name: document.name,
    url: document.url,
    fileName: document.fileName,
    type: document.type,
    uploadedAt: document.createdAt,
  };
}

function userTransformer(user) {
  if (!user) return null;

  // Prefer user.documents, fallback to user.Documents
  const documents = user.documents || user.Documents || [];

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    nationalId: user.nationalId,
    isActive: user.isActive,
    notes: user.notes,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    avatar:
      documents.find((doc) => doc.documentType === "profile_photo") || null,

    documents: documents.filter((doc) => doc.documentType !== "profile_photo"),

    receivedPayments: user.receivedPayments || [],
    createdReservations: user.createdReservations || [],
    brokerReservations: user.brokerReservations || [],
    reservations: user.reservations || [],
  };
}

function reservationTransformer(reservation) {
  if (!reservation) return null;

  // Calculate paidAmount from payments
  const paidAmount = Array.isArray(reservation.payments)
    ? reservation.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    : 0;
  const remainingAmount = reservation.price
    ? Number(reservation.price) - paidAmount
    : 0;

  return {
    id: reservation.id,
    roomId: reservation.roomId,
    reservationType: reservation.reservationType,
    createdBy: reservation.createdBy,
    // brokerId: reservation.brokerId,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    price: reservation.price,
    priceUnit: reservation.priceUnit,
    brokerCommissionPercent: reservation.brokerCommissionPercent,
    brokerCommissionAmount: reservation.brokerCommissionAmount,
    customerDetails: reservation.customerDetails,
    paymentStatus: reservation.paymentStatus,
    notes: reservation.notes,
    hasCheckedIn: reservation.hasCheckedIn,
    hasCheckedOut: reservation.hasCheckedOut,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
    paidAmount,
    remainingAmount,
    documents: reservation.documents?.map(documentTransformer) || [],
    customers: (reservation.customers || []).map(userTransformer) || [],
    payments: reservation.payments || [],
    room: reservation.room ? roomTransformer(reservation.room) : undefined,
    broker: reservation.broker ? userTransformer(reservation.broker) : null,
  };
}

function paymentTransformer(payment) {
  if (!payment) return null;
  const { userTransformer } = require("./transformers");
  return {
    id: payment.id,
    reservationId: payment.reservationId,
    amount: payment.amount,
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    receivedBy: payment.receivedBy,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    reservation: payment.reservation || undefined,
    receivedByUser: payment.receivedByUser
      ? userTransformer(payment.receivedByUser)
      : undefined,
  };
}

function roomTransformer(room) {
  if (!room) return null;
  const now = new Date();
  const hasActiveReservation = (room.reservations || []).some(
    (res) => new Date(res.checkIn) <= now && new Date(res.checkOut) >= now
  );
  const status = hasActiveReservation
    ? "occupied"
    : room.isClean
    ? "clean"
    : "dirty";
  return {
    id: room.id,
    roomNumber: room.roomNumber,
    capacity: room.capacity,
    price: room.price,
    description: room.description,
    isClean: room.isClean,
    status,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    reservations: (room.reservations || []).map((reservation) => ({
      id: reservation.id,
      roomId: reservation.roomId,
      reservationType: reservation.reservationType,
      paymentStatus: reservation.paymentStatus,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      paidAmount: reservation.paidAmount,
      notes: reservation.notes,
      hasCheckedIn: reservation.hasCheckedIn,
      hasCheckedOut: reservation.hasCheckedOut,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      createdByUser: reservation.createdByUser && {
        id: reservation.createdByUser.id,
        username: reservation.createdByUser.username,
        email: reservation.createdByUser.email,
        avatar:
          avatarTransformer(
            reservation.createdByUser.avatar ||
              (reservation.createdByUser.documents || []).find(
                (doc) => doc.documentType === "profile_photo"
              )
          ) || null,
      },
      broker: reservation.broker && {
        id: reservation.broker.id,
        username: reservation.broker.username,
        email: reservation.broker.email,
        avatar:
          avatarTransformer(
            reservation.broker.avatar ||
              (reservation.broker.documents || []).find(
                (doc) => doc.documentType === "profile_photo"
              )
          ) || null,
      },
      customers:
        (reservation.customers || []).map((customer) =>
          userTransformer({
            ...customer,
            documents: customer.documents || customer.Documents || [],
          })
        ) || [],
      payments: (reservation.payments || []).map(paymentTransformer),
    })),
  };
}

module.exports = {
  userTransformer,
  reservationTransformer,
  paymentTransformer,
  avatarTransformer,
  documentTransformer,
  roomTransformer,
};
