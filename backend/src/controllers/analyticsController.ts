import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import { Task, Subject, Schedule, sequelize } from '../models';
import { AuthRequest } from '../middleware/auth';

// Get productivity analytics
const getProductivityAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const where: Record<string, unknown> = {
      userId: req.user!.id,
      completed: true
    };

    let dateFilter: Record<string, unknown>;
    if (startDate && endDate) {
      dateFilter = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { [Op.gte]: thirtyDaysAgo };
    }

    where.createdAt = dateFilter;

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
        userId: req.user!.id,
        createdAt: dateFilter
      }
    });

    const completedTasks = await Task.count({ where });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks by priority
    const tasksByPriority = await Task.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        userId: req.user!.id,
        createdAt: dateFilter
      },
      group: ['priority']
    });

    // Tasks by subject (raw SQL)
    const dateFilterAny = dateFilter as unknown as Record<string, unknown>;
    const startDateVal = (dateFilterAny[Op.between as unknown as string] as unknown[])?.[0] as Date || dateFilterAny[Op.gte as unknown as string] as Date || new Date(0);
    const endDateVal = (dateFilterAny[Op.between as unknown as string] as unknown[])?.[1] as Date || new Date();

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
          userId: req.user!.id,
          startDate: startDateVal as Date,
          endDate: endDateVal as Date
        },
        type: QueryTypes.SELECT
      }
    );

    const tasksBySubject = (tasksBySubjectRaw as Array<Record<string, unknown>>).map(item => ({
      subjectName: item.subjectName || 'Uncategorized',
      subjectColor: item.subjectColor || '#808080',
      count: parseInt(item.count as string) || 0
    }));

    // Study hours per day
    const studyHoursPerDay: Array<{ dayOfWeek: number; hours: number }> = [];

    try {
      const schedules = await Schedule.findAll({
        where: {
          userId: req.user!.id,
          activityType: 'study'
        },
        attributes: ['dayOfWeek', 'startTime', 'endTime']
      });

      const hoursByDay: Record<number, number> = {};
      for (let i = 0; i < 7; i++) {
        hoursByDay[i] = 0;
      }

      schedules.forEach(schedule => {
        if (schedule.startTime && schedule.endTime) {
          const start = new Date(schedule.startTime);
          const end = new Date(schedule.endTime);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          if (hours > 0) {
            hoursByDay[schedule.dayOfWeek] += hours;
          }
        }
      });

      for (let day = 0; day < 7; day++) {
        studyHoursPerDay.push({
          dayOfWeek: day,
          hours: Math.round(hoursByDay[day] * 10) / 10
        });
      }
    } catch (scheduleError) {
      console.error('Error calculating study hours:', (scheduleError as Error).message);
      for (let day = 0; day < 7; day++) {
        studyHoursPerDay.push({ dayOfWeek: day, hours: 0 });
      }
    }

    const responseData = {
      tasksPerDay: tasksPerDay.map(item => ({
        date: (item.dataValues as unknown as Record<string, unknown>).date || (item as unknown as Record<string, unknown>).date,
        count: parseInt((item.dataValues as unknown as Record<string, unknown>).count as string) || 0
      })),
      completionRate: Math.round(completionRate * 100) / 100,
      tasksByPriority: tasksByPriority.map(item => ({
        priority: (item.dataValues as unknown as Record<string, unknown>).priority || (item as unknown as Record<string, unknown>).priority,
        count: parseInt((item.dataValues as unknown as Record<string, unknown>).count as string) || 0
      })),
      tasksBySubject: tasksBySubject,
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
const getOverdueTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.findAll({
      where: {
        userId: req.user!.id,
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
const getWorkloadDistribution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await Task.findAll({
      where: {
        userId: req.user!.id,
        completed: false,
        dueDate: {
          [Op.lte]: nextWeek
        }
      },
      include: [Subject],
      order: [['dueDate', 'ASC']]
    });

    const workloadByDay: Record<string, typeof tasks> = {};
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

export {
  getProductivityAnalytics,
  getOverdueTasks,
  getWorkloadDistribution
};
