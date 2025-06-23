// utils/constants.js

const ENUMS = {
  RESERVATION_TYPES: [
    "student_male",
    "student_female",
    "medical_male",
    "medical_female",
    "customer",
  ],
  PAYMENT_STATUSES: ["pending", "partial", "paid", "refunded"],
  USER_ROLES: ["admin", "receptionist", "broker", "customer"],
};

module.exports = ENUMS;
