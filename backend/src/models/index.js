const sequelize = require('../config/database');
const User = require('./user');
const Subject = require('./subject');
const Task = require('./task');
const Schedule = require('./schedule');

// Define associations
User.hasMany(Subject, { foreignKey: 'userId', onDelete: 'CASCADE' });
Subject.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

Subject.hasMany(Task, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
Task.belongsTo(Subject, { foreignKey: 'subjectId' });

User.hasMany(Schedule, { foreignKey: 'userId', onDelete: 'CASCADE' });
Schedule.belongsTo(User, { foreignKey: 'userId' });

Subject.hasMany(Schedule, { foreignKey: 'subjectId', onDelete: 'SET NULL' });
Schedule.belongsTo(Subject, { foreignKey: 'subjectId' });

Task.hasMany(Schedule, { foreignKey: 'taskId', onDelete: 'SET NULL' });
Schedule.belongsTo(Task, { foreignKey: 'taskId' });

module.exports = {
  sequelize,
  User,
  Subject,
  Task,
  Schedule
};