const { Task, Subject, Schedule, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');

// Helper function to sanitize analytics data
const sanitizeAnalyticsData = (data) => {
  return {
    ...data,
    completionRate: isFinite(data.completionRate) ? data.completionRate : 0,
    tasksPerDay: (data.tasksPerDay || []).map(item => ({
      ...item,
      count: parseInt(item.count) || 0,
      date: item.date || new Date().toISOString().split('T')[0]
    })),
    tasksByPriority: (data.tasksByPriority || []).map(item => ({
      ...item,
      count: parseInt(item.count) || 0
    })),
    tasksBySubject: (data.tasksBySubject || []).map(item => ({
      ...item,
      count: parseInt(item.count) || 0,
      subjectName: item.subjectName || 'Uncategorized',
      subjectColor: item.subjectColor || '#808080'
    })),
    studyHoursPerDay: (data.studyHoursPerDay || []).map(item => ({
      ...item,
      hours: parseFloat(item.hours) || 0,
      dayOfWeek: item.dayOfWeek || 0
    }))
  };
};

// Get productivity analytics
const getProductivityAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      userId: req.user.id,
      completed: true
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = {
        [Op.gte]: thirtyDaysAgo
      };
    }

    // Tasks completed per day
    const tasksPerDay = await Task.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // Task completion rate
    const totalTasks = await Task.count({
      where: {
        userId: req.user.id,
        createdAt: where.createdAt
      }
    });

    const completedTasks = await Task.count({
      where
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks by priority
    const tasksByPriority = await Task.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        userId: req.user.id,
        createdAt: where.createdAt
      },
      group: ['priority']
    });

    // Tasks by subject
    const tasksBySubjectRaw = await sequelize.query(
      `SELECT 
        s."name" as "subjectName",
        s."color" as "subjectColor",
        COUNT(*) as count
      FROM tasks t
      LEFT JOIN subjects s ON t."subjectId" = s.id
      WHERE t."userId" = :userId 
        AND t."createdAt" >= :startDate
        AND t."createdAt" <= :endDate
        AND t.completed = true
      GROUP BY s.id, s."name", s."color"
      ORDER BY count DESC`,
      {
        replacements: {
          userId: req.user.id,
          startDate: where.createdAt?.[Op.between]?.[0] || where.createdAt?.[Op.gte],
          endDate: where.createdAt?.[Op.between]?.[1] || new Date()
        },
        type: QueryTypes.SELECT
      }
    );

    const tasksBySubject = tasksBySubjectRaw.map(item => ({
      subjectName: item.subjectName || 'Uncategorized',
      subjectColor: item.subjectColor || '#808080',
      count: parseInt(item.count) || 0
    }));

    // Study hours per day - simplified version to avoid PostgreSQL specific syntax issues
    const studyHoursPerDay = [];
    
    try {
      const schedules = await Schedule.findAll({
        where: {
          userId: req.user.id,
          activityType: 'study'
        },
        attributes: ['dayOfWeek', 'startTime', 'endTime']
      });

      // Calculate hours per day
      const hoursByDay = {};
      for (let i = 0; i < 7; i++) {
        hoursByDay[i] = 0;
      }

      schedules.forEach(schedule => {
        if (schedule.startTime && schedule.endTime) {
          const start = new Date(schedule.startTime);
          const end = new Date(schedule.endTime);
          const hours = (end - start) / (1000 * 60 * 60); // Convert ms to hours
          if (hours > 0) {
            hoursByDay[schedule.dayOfWeek] += hours;
          }
        }
      });

      // Format the response
      for (let day = 0; day < 7; day++) {
        studyHoursPerDay.push({
          dayOfWeek: day,
          hours: Math.round(hoursByDay[day] * 10) / 10 // Round to 1 decimal place
        });
      }
    } catch (scheduleError) {
      console.error('Error calculating study hours:', scheduleError);
      // Fallback: return zero hours for all days
      for (let day = 0; day < 7; day++) {
        studyHoursPerDay.push({
          dayOfWeek: day,
          hours: 0
        });
      }
    }

    const responseData = {
      tasksPerDay: tasksPerDay.map(item => ({
        date: item.dataValues?.date || item.date,
        count: parseInt(item.dataValues?.count || item.count) || 0
      })),
      completionRate: Math.round(completionRate * 100) / 100,
      tasksByPriority: tasksByPriority.map(item => ({
        priority: item.dataValues?.priority || item.priority,
        count: parseInt(item.dataValues?.count || item.count) || 0
      })),
      tasksBySubject: (tasksBySubject || []).map(item => ({
        subjectName: item.subjectName || 'Uncategorized',
        subjectColor: item.subjectColor || '#808080',
        count: parseInt(item.count) || 0
      })),
      studyHoursPerDay: studyHoursPerDay,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.findAll({
      where: {
        userId: req.user.id,
        completed: false,
        dueDate: {
          [Op.lt]: today
        }
      },
      include: [Subject],
      order: [['dueDate', 'ASC']]
    });

    res.json(overdueTasks);
  } catch (error) {
    console.error('Overdue tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
};

// Get workload distribution
const getWorkloadDistribution = async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await Task.findAll({
      where: {
        userId: req.user.id,
        completed: false,
        dueDate: {
          [Op.lte]: nextWeek
        }
      },
      include: [Subject],
      order: [['dueDate', 'ASC']]
    });

    // Group by day
    const workloadByDay = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const day = task.dueDate.toISOString().split('T')[0];
        if (!workloadByDay[day]) {
          workloadByDay[day] = [];
        }
        workloadByDay[day].push(task);
      }
    });

    res.json(workloadByDay);
  } catch (error) {
    console.error('Workload distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch workload distribution' });
  }
};

module.exports = {
  getProductivityAnalytics,
  getOverdueTasks,
  getWorkloadDistribution
};