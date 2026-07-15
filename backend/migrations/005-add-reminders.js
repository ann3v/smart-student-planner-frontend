'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Add reminder fields to tasks table
    await queryInterface.addColumn('tasks', 'reminderEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    await queryInterface.addColumn('tasks', 'reminderMinutesBefore', {
      type: Sequelize.INTEGER,
      defaultValue: 30,
      allowNull: false
    });

    await queryInterface.addColumn('tasks', 'reminderSent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Add reminder fields to schedule table
    await queryInterface.addColumn('schedule', 'reminderEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    await queryInterface.addColumn('schedule', 'reminderMinutesBefore', {
      type: Sequelize.INTEGER,
      defaultValue: 15,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove reminder fields from tasks table
    await queryInterface.removeColumn('tasks', 'reminderEnabled');
    await queryInterface.removeColumn('tasks', 'reminderMinutesBefore');
    await queryInterface.removeColumn('tasks', 'reminderSent');

    // Remove reminder fields from schedule table
    await queryInterface.removeColumn('schedule', 'reminderEnabled');
    await queryInterface.removeColumn('schedule', 'reminderMinutesBefore');
  }
};
