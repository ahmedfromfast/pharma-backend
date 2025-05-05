const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/docController');
const  authenticateToken  = require('../middleware/authMiddleware');

router.post('/register', authenticateToken, doctorController.registerDoctor);
router.get('/approved', doctorController.getApprovedDoctors);
router.put('/approve/:doctorId', authenticateToken, doctorController.approveDoctor);
router.get('/unapproved', doctorController.getUnApprovedDoctors);
router.get('/doctors', doctorController.getDoctors);

module.exports = router;
