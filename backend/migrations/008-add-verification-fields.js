'use strict';

// Adds email verification columns to the users table.
// These fields existed in the Sequelize model but had no migration,
// meaning they were only created by sync({ alter: true }) in development.
// In production (where alter is disabled) the columns would be missing
// and registration / login / verification would fail.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'verificationCodeHash', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'verificationExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'verificationExpiresAt');
    await queryInterface.removeColumn('users', 'verificationCodeHash');
    await queryInterface.removeColumn('users', 'isVerified');
  },
};