import { Router } from 'express';
import { createSchedule, getSchedule, getScheduleById, getTodaySchedule, getWeeklySchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController';
import auth from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createScheduleSchema, updateScheduleSchema } from '../schemas/scheduleSchema';

const router = Router();

router.use(auth);

router.post('/', validate(createScheduleSchema), createSchedule);
router.get('/', getSchedule);
router.get('/today', getTodaySchedule);
router.get('/weekly', getWeeklySchedule);
router.get('/:id', getScheduleById);
router.put('/:id', validate(updateScheduleSchema), updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
