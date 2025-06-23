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

module.exports = { userTransformer, reservationTransformer };
