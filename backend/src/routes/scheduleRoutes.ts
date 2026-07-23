import { Router } from 'express';
import { createSchedule, getSchedule, getTodaySchedule, getWeeklySchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);

router.post('/', createSchedule);
router.get('/', getSchedule);
router.get('/today', getTodaySchedule);
router.get('/weekly', getWeeklySchedule);
router.get('/:id', getSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
