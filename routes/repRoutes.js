const express = require('express');
const router = express.Router();
const repController = require('../controllers/repController');


router.post('/', repController.createReport);
router.get('/', repController.getAllReports);
router.get('/my', repController.getMyReports);
router.get('/:id', repController.getReport);
router.get('/:id/status', repController.getReportStatus);
router.put('/:id/status', repController.updateReportStatus);

module.exports = router;
