"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // الحجز تابع لغرفة
      Reservation.belongsTo(models.Room, { foreignKey: "roomId", as: "room" });

      // أنشأه موظف
      Reservation.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "createdByUser",
      });

      // الوسيط (اختياري)
      Reservation.belongsTo(models.User, {
        foreignKey: "brokerId",
        as: "broker",
      });

      // Many-to-Many مع المستخدمين (المشترين)
      Reservation.belongsToMany(models.User, {
        through: models.ReservationCustomer,
        foreignKey: "reservationId",
        otherKey: "userId",
        as: "customers",
      });

      // المدفوعات المرتبطة بالحجز
      Reservation.hasMany(models.Payment, {
        foreignKey: "reservationId",
        as: "payments",
      });
    }
  }
  Reservation.init(
    {
      roomId: DataTypes.INTEGER,
      createdBy: DataTypes.INTEGER,
      brokerId: DataTypes.INTEGER,
      reservationType: {
        type: DataTypes.ENUM("student", "medical"),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "partial", "paid", "refunded"),
        defaultValue: "pending",
      },
      checkIn: DataTypes.DATE,
      checkOut: DataTypes.DATE,
      paidAmount: DataTypes.DECIMAL,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Reservation",
    }
  );
  return Reservation;
};
