"use strict";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn("Rooms", "type", {
      type: Sequelize.ENUM("student", "medical", "customer"),
      allowNull: false,
      defaultValue: "customer",
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface
      .removeColumn("Rooms", "type")
      .then(() =>
        queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Rooms_type";')
      );
  },
};
