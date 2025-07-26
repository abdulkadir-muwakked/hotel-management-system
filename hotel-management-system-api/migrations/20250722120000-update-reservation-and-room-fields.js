"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Reservation changes
    await queryInterface.changeColumn("Reservations", "price", {
      type: Sequelize.DECIMAL,
      allowNull: false,
    });
    await queryInterface.changeColumn("Reservations", "priceUnit", {
      type: Sequelize.ENUM("daily", "weekly", "monthly", "seasonal"),
      allowNull: true,
    });
    await queryInterface.changeColumn(
      "Reservations",
      "brokerCommissionPercent",
      {
        type: Sequelize.DECIMAL,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      "Reservations",
      "brokerCommissionAmount",
      {
        type: Sequelize.DECIMAL,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn("Reservations", "paidAmount", {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("Reservations", "customerDetails", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    // Update reservationType ENUM
    await queryInterface.changeColumn("Reservations", "reservationType", {
      type: Sequelize.ENUM(
        "student",
        "nurse",
        "broker",
        "student_male",
        "student_female",
        "medical_male",
        "medical_female",
        "customer"
      ),
      allowNull: false,
    });
    // Remove numberOfDays if exists
    try {
      await queryInterface.removeColumn("Reservations", "numberOfDays");
    } catch (e) {}
    // Room changes
    try {
      await queryInterface.removeColumn("Rooms", "price");
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    // Revert Reservation changes
    await queryInterface.removeColumn("Reservations", "price");
    await queryInterface.removeColumn("Reservations", "priceUnit");
    await queryInterface.removeColumn(
      "Reservations",
      "brokerCommissionPercent"
    );
    await queryInterface.removeColumn("Reservations", "brokerCommissionAmount");
    await queryInterface.changeColumn("Reservations", "paidAmount", {
      type: Sequelize.DECIMAL,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.removeColumn("Reservations", "customerDetails");
    await queryInterface.changeColumn("Reservations", "reservationType", {
      type: Sequelize.ENUM(
        "student_male",
        "student_female",
        "medical_male",
        "medical_female",
        "customer"
      ),
      allowNull: false,
    });
    // Add numberOfDays back if needed
    await queryInterface.addColumn("Reservations", "numberOfDays", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    // Room changes
    await queryInterface.addColumn("Rooms", "price", {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
  },
};
