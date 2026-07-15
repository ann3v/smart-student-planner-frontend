const { Subject, Task, sequelize } = require('../models');

// Create subject
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// Get all subjects for user
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']]
    });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// Get subject with tasks
const getSubjectWithTasks = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [Task]
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    await subject.update(req.body);
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    await subject.destroy();
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectWithTasks,
  updateSubject,
  deleteSubject
};