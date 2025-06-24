// utils/transformers.js
function userTransformer(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Add more fields as needed
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
    customers:
      reservation.customers?.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      })) || [],
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

module.exports = {
  userTransformer,
  reservationTransformer,
  paymentTransformer,
};
