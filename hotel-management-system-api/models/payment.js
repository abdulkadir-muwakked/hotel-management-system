"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.Reservation, {
        foreignKey: "reservationId",
        as: "reservation",
      });
      Payment.belongsTo(models.User, {
        foreignKey: "receivedBy",
        as: "receivedByUser",
      });
    }
  }
  Payment.init(
    {
      reservationId: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL,
      paymentDate: DataTypes.DATE,
      paymentMethod: {
        type: DataTypes.ENUM("cash", "card", "transfer", "other"),
        allowNull: false,
      },
      receivedBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );
  return Payment;
};
