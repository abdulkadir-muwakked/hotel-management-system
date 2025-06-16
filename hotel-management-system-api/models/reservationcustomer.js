"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReservationCustomer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ReservationCustomer.belongsTo(models.User, { foreignKey: "userId" });
      ReservationCustomer.belongsTo(models.Reservation, {
        foreignKey: "reservationId",
      });
    }
  }
  ReservationCustomer.init(
    {
      reservationId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ReservationCustomer",
    }
  );
  return ReservationCustomer;
};
