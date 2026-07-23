import { Router } from 'express';
import { getProductivityAnalytics, getOverdueTasks, getWorkloadDistribution } from '../controllers/analyticsController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/productivity', getProductivityAnalytics);
router.get('/overdue', getOverdueTasks);
router.get('/workload', getWorkloadDistribution);

export default router;
