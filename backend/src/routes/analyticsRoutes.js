const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/productivity', analyticsController.getProductivityAnalytics);
router.get('/overdue', analyticsController.getOverdueTasks);
router.get('/workload', analyticsController.getWorkloadDistribution);

module.exports = router;