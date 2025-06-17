"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Document, { foreignKey: "userId", as: "documents" });

      // المستخدم أنشأ الحجز (موظف)
      User.hasMany(models.Reservation, {
        foreignKey: "createdBy",
        as: "createdReservations",
      });

      // المستخدم كوسيط (broker)
      User.hasMany(models.Reservation, {
        foreignKey: "brokerId",
        as: "brokerReservations",
      });

      // Many-to-Many مع الحجوزات كمشتري
      User.belongsToMany(models.Reservation, {
        through: models.ReservationCustomer,
        foreignKey: "userId",
        otherKey: "reservationId",
        as: "reservations",
      });

      // المدفوعات التي استلمها
      User.hasMany(models.Payment, {
        foreignKey: "receivedBy",
        as: "receivedPayments",
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      passwordHash: DataTypes.STRING,
      phone: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM(
          "admin",
          "receptionist",
          "broker",
          "customer",
          "student",
          "doctor"
        ),
        allowNull: false,
      },
      nationalId: DataTypes.STRING,
      address: DataTypes.TEXT,
      isActive: DataTypes.BOOLEAN,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
