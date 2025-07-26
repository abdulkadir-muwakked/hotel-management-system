"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Room.hasMany(models.Reservation, {
        foreignKey: "roomId",
        as: "reservations",
      });
    }
  }
  Room.init(
    {
      roomNumber: DataTypes.STRING,
      capacity: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      isClean: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Room",
    }
  );
  return Room;
};
