import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Task, Subject } from '../models';
import { AuthRequest } from '../middleware/auth';

// Create task
const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, subjectId, priority, dueDate, estimatedDuration } = req.body;

    const task = await Task.create({
      title,
      description,
      subjectId,
      priority,
      dueDate,
      estimatedDuration,
      userId: req.user!.id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Get all tasks for user
const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { completed, subjectId, priority, startDate, endDate } = req.query;

    const where: Record<string, unknown> = { userId: req.user!.id };

    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (priority) {
      where.priority = priority;
    }

    if (startDate && endDate) {
      where.dueDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const tasks = await Task.findAll({
      where,
      include: [Subject],
      order: [['dueDate', 'ASC'], ['priority', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get single task
const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: [Subject]
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Update task
const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const { title, description, subjectId, priority, dueDate, estimatedDuration, completed, reminderEnabled, reminderMinutesBefore } = req.body;

    await task.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(subjectId !== undefined && { subjectId }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate }),
      ...(estimatedDuration !== undefined && { estimatedDuration }),
      ...(completed !== undefined && { completed }),
      ...(reminderEnabled !== undefined && { reminderEnabled }),
      ...(reminderMinutesBefore !== undefined && { reminderMinutesBefore }),
    });
    await task.reload({ include: [Subject] });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task
const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Toggle task completion
const toggleTaskCompletion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task completion' });
  }
};

// Get today's tasks
const getTodayTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.findAll({
      where: {
        userId: req.user!.id,
        dueDate: {
          [Op.between]: [today, tomorrow]
        }
      },
      include: [Subject],
      order: [['priority', 'DESC'], ['dueDate', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s tasks' });
  }
};

// Get upcoming tasks
const getUpcomingTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await Task.findAll({
      where: {
        userId: req.user!.id,
        dueDate: {
          [Op.between]: [today, nextWeek]
        },
        completed: false
      },
      include: [Subject],
      order: [['dueDate', 'ASC'], ['priority', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
  }
};

export {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTodayTasks,
  getUpcomingTasks
};