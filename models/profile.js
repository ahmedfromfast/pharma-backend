const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  fullName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  gender: String,
  dateOfBirth: Date,
  passwordHash: String,

  // Personal Details Section
  personalDetails: {
    registrationNumber: String,  // For doctors/professionals
    identification: String,      // Could be AIMS, SSN, etc.
    additionalContacts: [{
      type: { type: String },    // e.g., "emergency", "secondary"
      number: String
    }]
  },

  // Address Details (expanded based on Figma)
  addresses: {
    personal: {
      pinCode: String,
      street: String,
      city: String,
      state: String,
      country: String
    },
    business: {                 // Added business address
      pinCode: String,
      street: String,
      city: String,
      state: String,
      country: String,
      companyName: String
    }
  },

  // Professional Details (from Featured Service section)
  professionalDetails: {
    services: [String],         // Featured services
    frameworks: [String],       // Professional frameworks used
    pricing: String,            // Pricing model
    processes: [String]         // Work processes
  },

  // Additional sections from Figma
  preferences: {
    notificationMethods: [String],  // SMS, Email, etc.
    language: String,
    timezone: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);