const Appointment = require('../models/appointment');
const Doc = require("../models/doctor")
const User = require('../models/user');
const generateTimeSlots = require('../utils/slots');
exports.createAppointment = async (req, res) => {
    const { patientId, doctorId, appointmentDate, slot } = req.body;

    if (!appointmentDate || !slot) {
        return res.status(400).json({ message: 'Date and slot are required' });
    }

    try {
        const [hour, minute] = slot.split(':');
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);


        const existing = await Appointment.findOne({
            doctorId,
            appointmentDate: appointmentDateTime,
            status: { $ne: 'cancelled' }
        });

        if (existing) {
            return res.status(409).json({ message: 'Slot already booked' });
        }

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate: appointmentDateTime, // ✅ Use the correct full datetime
            slot
        });

        await newAppointment.save();

        res.status(201).json({ message: 'Appointment created', appointment: newAppointment });
    } catch (error) {
        console.error('Appointment creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAvailableSlots = async (req, res) => {

    const { userId, date } = req.query; // date = '2025-05-06'
    const doctor = await Doc.findOne({ userId });
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({ doctorId: doctor._id, appointmentDate: { $gte: startOfDay, $lte: endOfDay }, });
    const allSlots = generateTimeSlots(); // Default 09:00–17:00


    const bookedSlots = appointments.map(app => app.slot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
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
        const { appointmentDate, slot } = req.body;

        if (!appointmentDate || !slot) {
            return res.status(400).json({ message: 'Date and slot are required' });
        }

        const [hour, minute] = slot.split(':');
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);



        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { appointmentDate: appointmentDateTime },
            { slot: slot },
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

        const updatedAppointment = await Appointment.findByIdAndDelete(id);

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ message: 'Appointment has been cancelled', appointment: updatedAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAppointmentsByDoctorId = async (req, res) => {
    const { userId } = req.params;

    try {
        const doctor = await Doc.findOne({ userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found for this user' });
        }
        const appointments = await Appointment.find({ doctorId: doctor._id, status: 'pending' })
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

        const appointments = await Appointment.find({ patientId: user._id, status: 'pending' });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this user' });
        }

        // Enhance each appointment with doctor info from the Doc collection
        const enrichedAppointments = await Promise.all(
            appointments.map(async (appointment) => {
                let doctor = null;
                let doctorUser = null;

                if (appointment.doctorId) {
                    doctor = await Doc.findById(appointment.doctorId);
                    if (doctor && doctor.user) {
                        doctorUser = await User.findById(doctor.user, 'name email'); // Only get needed fields
                    }
                }


                return {
                    ...appointment.toObject(),
                    doctor: doctor
                        ? {
                            _id: doctor._id,
                            specialization: doctor.specialization,
                            qualifications: doctor.qualifications,
                            experience: doctor.experience,
                            name: doctorUser ? doctorUser.name : null,
                            email: doctorUser ? doctorUser.email : null,
                        }
                        : null,
                };
            })
        );
        console.log(enrichedAppointments);

        res.status(200).json(enrichedAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};