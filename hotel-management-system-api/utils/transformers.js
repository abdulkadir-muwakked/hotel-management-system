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

module.exports = { userTransformer };
