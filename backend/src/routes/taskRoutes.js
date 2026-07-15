const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/today', taskController.getTodayTasks);
router.get('/upcoming', taskController.getUpcomingTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/toggle', taskController.toggleTaskCompletion);

module.exports = router;