import { Request, Response } from 'express';
import { Schedule, Subject, Task } from '../models';
import { AuthRequest } from '../middleware/auth';

// Create schedule item
const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scheduleData = {
      ...req.body,
      userId: req.user!.id
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
const getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dayOfWeek } = req.query;

    const where: Record<string, unknown> = { userId: req.user!.id };

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
const getTodaySchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const schedule = await Schedule.findAll({
      where: {
        userId: req.user!.id,
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
const getWeeklySchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findAll({
      where: { userId: req.user!.id },
      include: [Subject, Task],
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });

    const weeklySchedule: Record<number, typeof schedule> = {};
    for (let i = 0; i < 7; i++) {
      weeklySchedule[i] = schedule.filter(item => item.dayOfWeek === i);
    }

    res.json(weeklySchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly schedule' });
  }
};

// Update schedule item
const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!schedule) {
      res.status(404).json({ error: 'Schedule item not found' });
      return;
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
const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!schedule) {
      res.status(404).json({ error: 'Schedule item not found' });
      return;
    }

    await schedule.destroy();
    res.json({ message: 'Schedule item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete schedule item' });
  }
};

export {
  createSchedule,
  getSchedule,
  getTodaySchedule,
  getWeeklySchedule,
  updateSchedule,
  deleteSchedule
};
