const express = require('express');
const appointmentController = require('../controllers/aptController');

const router = express.Router();

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.put('/delete/:id', appointmentController.deleteAppointment);
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctorId);
router.get('/user/:userId', appointmentController.getAppointmentsByUserId);

module.exports = router;
