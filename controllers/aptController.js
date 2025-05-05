const Appointment = require('../models/appointment');
const Doc = require("../models/doctor")
const User = require('../models/user');

exports.createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, status } = req.body;

        console.log(patientId, doctorId, appointmentDate, status)
        if (!appointmentDate || isNaN(new Date(appointmentDate))) {
            return res.status(400).json({ message: 'Invalid appointment date' });
        }

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            status: status || 'pending'
        });

        console.log(newAppointment)
        await newAppointment.save();
        res.status(201).json({ message: 'Appointment has been created', appointment: newAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('patientId doctorId');
        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAppointmentById = async (req, res) => {
    const { user } = req.params;
    try {
        const appointment = await Appointment.findById(user).populate('patientId doctorId');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { appointmentDate } = req.body;

        if (appointmentDate && isNaN(new Date(appointmentDate))) {
            return res.status(400).json({ message: 'Invalid appointment date' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            {appointmentDate },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ message: 'Appointment has been updated', appointment: updatedAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const status = 'cancelled';

        console.log(id);
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ message: 'Appointment has been cancelled', appointment: updatedAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all appointments for a specific doctor
exports.getAppointmentsByDoctorId = async (req, res) => {
    const { userId } = req.params;

    try {
        const doctor = await Doc.findOne({ userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found for this user' });
        }
        const appointments = await Appointment.find({ doctorId: doctor._id })
            .populate('patientId');

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor' });
        }
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAppointmentsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found for this ID' });
        }

        const appointments = await Appointment.find({ patientId: user._id }).populate('patientId');

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this user' });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};