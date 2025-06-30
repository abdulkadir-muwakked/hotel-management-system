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

  const documents = user.Documents || [];

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    avatar:
      user.documents?.find((doc) => doc.documentType === "profile_photo") ||
      null,

    documents: documents.filter((doc) => doc.documentType !== "profile_photo"),

    receivedPayments: user.receivedPayments || [],
    createdReservations: user.createdReservations || [],
    brokerReservations: user.brokerReservations || [],
    reservations: user.reservations || [],
  };
}

function reservationTransformer(reservation) {
  if (!reservation) return null;

  return {
    id: reservation.id,
    roomId: reservation.roomId,
    reservationType: reservation.reservationType,
    createdBy: reservation.createdBy,
    brokerId: reservation.brokerId,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    paidAmount: reservation.paidAmount,
    paymentStatus: reservation.paymentStatus,
    notes: reservation.notes,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
    documents: reservation.documents?.map(documentTransformer) || [],
    customers: (reservation.customers || []).map(userTransformer) || [],
  };
}

function paymentTransformer(payment) {
  if (!payment) return null;
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
    receivedByUser: payment.receivedByUser || undefined,
  };
}

function roomTransformer(room) {
  if (!room) return null;
  return {
    id: room.id,
    roomNumber: room.roomNumber,
    capacity: room.capacity,
    price: room.price,
    description: room.description,
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
