const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', scheduleController.createSchedule);
router.get('/', scheduleController.getSchedule);
router.get('/today', scheduleController.getTodaySchedule);
router.get('/weekly', scheduleController.getWeeklySchedule);
router.get('/:id', scheduleController.getSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;