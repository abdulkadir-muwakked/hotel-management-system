"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Rooms", "isClean", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
    await queryInterface.addColumn("Reservations", "hasCheckedIn", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn("Reservations", "hasCheckedOut", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Rooms", "isClean");
    await queryInterface.removeColumn("Reservations", "hasCheckedIn");
    await queryInterface.removeColumn("Reservations", "hasCheckedOut");
  },
};
