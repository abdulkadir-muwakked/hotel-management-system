"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "ALTER TABLE Users MODIFY COLUMN role ENUM('admin', 'receptionist', 'broker', 'customer', 'student', 'doctor') NOT NULL;"
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "ALTER TABLE Users MODIFY COLUMN role ENUM('admin', 'receptionist', 'broker', 'customer') NOT NULL;"
    );
  },
};
