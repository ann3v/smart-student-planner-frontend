'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add brute-force protection fields to users table
    await queryInterface.addColumn('users', 'failedLoginAttempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'failedVerificationAttempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'lockoutUntil', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add index on lockoutUntil for querying locked accounts
    await queryInterface.addIndex('users', ['lockoutUntil'], {
      name: 'users_lockout_until_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_lockout_until_index');
    await queryInterface.removeColumn('users', 'lockoutUntil');
    await queryInterface.removeColumn('users', 'failedVerificationAttempts');
    await queryInterface.removeColumn('users', 'failedLoginAttempts');
  },
};