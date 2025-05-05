const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpires: Date,
  resetCode: String,
  resetCodeExpires: Date,

  profile: {
    phone: String,
    gender: String,
    dateOfBirth: Date,
    avatar: String, // <-- Add this line
    address: {
      street: String,
      city: String,
      state: String,
      pinCode: String,
      country: String
    },
    professional: {
      specialty: String,
      services: [String],
    }
  },
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
