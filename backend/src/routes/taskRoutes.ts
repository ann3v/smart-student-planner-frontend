import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, toggleTaskCompletion, getTodayTasks, getUpcomingTasks } from '../controllers/taskController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.get('/upcoming', getUpcomingTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskCompletion);

export default router;
