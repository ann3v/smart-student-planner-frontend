const { Schedule, Subject, Task } = require('../models');
const { Op } = require('sequelize');

// Create schedule item
const createSchedule = async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      userId: req.user.id
    };

    const schedule = await Schedule.create(scheduleData);
    const scheduleWithRelations = await Schedule.findByPk(schedule.id, {
      include: [Subject, Task]
    });

    res.status(201).json(scheduleWithRelations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule item' });
  }
};

// Get schedule for user
const getSchedule = async (req, res) => {
  try {
    const { dayOfWeek, startDate, endDate } = req.query;
    
    const where = { userId: req.user.id };
    
    if (dayOfWeek !== undefined) {
      where.dayOfWeek = dayOfWeek;
    }

    const schedule = await Schedule.findAll({
      where,
      include: [Subject, Task],
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Get today's schedule
const getTodaySchedule = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)

    const schedule = await Schedule.findAll({
      where: {
        userId: req.user.id,
        dayOfWeek
      },
      include: [Subject, Task],
      order: [['startTime', 'ASC']]
    });
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s schedule' });
  }
};

// Get weekly schedule
const getWeeklySchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findAll({
      where: { userId: req.user.id },
      include: [Subject, Task],
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    // Group by day of week
    const weeklySchedule = {};
    for (let i = 0; i < 7; i++) {
      weeklySchedule[i] = schedule.filter(item => item.dayOfWeek === i);
    }

    res.json(weeklySchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly schedule' });
  }
};

// Update schedule item
const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    await schedule.update(req.body);
    const updatedSchedule = await Schedule.findByPk(schedule.id, {
      include: [Subject, Task]
    });

    res.json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule item' });
  }
};

// Delete schedule item
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    await schedule.destroy();
    res.json({ message: 'Schedule item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete schedule item' });
  }
};

module.exports = {
  createSchedule,
  getSchedule,
  getTodaySchedule,
  getWeeklySchedule,
  updateSchedule,
  deleteSchedule
};