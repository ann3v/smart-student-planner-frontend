import { Request, Response } from 'express';
import { Subject, Task } from '../models';
import { AuthRequest } from '../middleware/auth';

// Create subject
const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, color } = req.body;

    const subject = await Subject.create({
      name,
      color,
      userId: req.user!.id,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// Get all subjects for user
const getSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await Subject.findAll({
      where: { userId: req.user!.id },
      order: [['name', 'ASC']]
    });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// Get subject with tasks
const getSubjectWithTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: [Task]
    });

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};

// Update subject
const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    const { name, color } = req.body;

    await subject.update({
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

// Delete subject
const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    await subject.destroy();
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

export {
  createSubject,
  getSubjects,
  getSubjectWithTasks,
  updateSubject,
  deleteSubject
};