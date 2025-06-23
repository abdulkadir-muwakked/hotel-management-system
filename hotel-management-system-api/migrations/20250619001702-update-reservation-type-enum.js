"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Clean up any invalid reservationType values before altering the ENUM
    await queryInterface.sequelize.query(`
      UPDATE Reservations SET reservationType = 'customer'
      WHERE reservationType NOT IN ('student', 'medical', 'student_male', 'student_female', 'medical_male', 'medical_female', 'customer') OR reservationType IS NULL OR TRIM(reservationType) = '';
    `);
    // 2. تعديل البيانات القديمة لتناسب القيم الجديدة
    await queryInterface.sequelize.query(`
      UPDATE Reservations SET reservationType = 'student_male' WHERE reservationType = 'student';
    `);
    await queryInterface.sequelize.query(`
      UPDATE Reservations SET reservationType = 'medical_male' WHERE reservationType = 'medical';
    `);
    // 3. Clean up again in case any 'student' or 'medical' values remain
    await queryInterface.sequelize.query(`
      UPDATE Reservations SET reservationType = 'customer'
      WHERE reservationType NOT IN ('student_male', 'student_female', 'medical_male', 'medical_female', 'customer') OR reservationType IS NULL OR TRIM(reservationType) = '';
    `);
    // Debug: Print all unique reservationType values before altering the ENUM
    const [results] = await queryInterface.sequelize.query(
      "SELECT DISTINCT reservationType FROM Reservations"
    );
    console.log(
      "DEBUG: Unique reservationType values before ENUM change:",
      results
    );
    // 4. تعديل نوع الحقل نفسه
    await queryInterface.sequelize.query(`
      ALTER TABLE Reservations 
      MODIFY COLUMN reservationType ENUM(
        'student_male', 
        'student_female', 
        'medical_male', 
        'medical_female', 
        'customer'
      ) NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // 1. إعادة القيم الجديدة إلى القديمة
    await queryInterface.sequelize.query(`
      UPDATE Reservations SET reservationType = 'student' WHERE reservationType IN ('student_male', 'student_female');
    `);
    await queryInterface.sequelize.query(`
      UPDATE Reservations SET reservationType = 'medical' WHERE reservationType IN ('medical_male', 'medical_female');
    `);

    // 2. تعديل نوع الحقل للقديم
    await queryInterface.sequelize.query(`
      ALTER TABLE Reservations 
      MODIFY COLUMN reservationType ENUM(
        'student', 
        'medical'
      ) NOT NULL;
    `);
  },
};
