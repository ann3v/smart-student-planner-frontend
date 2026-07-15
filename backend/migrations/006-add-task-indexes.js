'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes on userId and subjectId for faster queries
    await queryInterface.addIndex('tasks', ['userId'], {
      name: 'tasks_user_id_index'
    });

    await queryInterface.addIndex('tasks', ['subjectId'], {
      name: 'tasks_subject_id_index'
    });

    // Add composite index for common filtering patterns
    await queryInterface.addIndex('tasks', ['userId', 'completed'], {
      name: 'tasks_user_completed_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('tasks', 'tasks_user_id_index');
    await queryInterface.removeIndex('tasks', 'tasks_subject_id_index');
    await queryInterface.removeIndex('tasks', 'tasks_user_completed_index');
  }
};
