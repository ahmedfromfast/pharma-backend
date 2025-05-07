const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointmentDate: { type: Date, required: true },
  slot: { type: String, required: true }, // e.g., "09:00"
  reason: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
