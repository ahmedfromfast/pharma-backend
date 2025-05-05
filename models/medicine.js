const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  requiresPrescription: Boolean,
  image: String, 
  averageRating: { type: Number, default: 0 }, // ⭐️ average rating
  totalReviews: { type: Number, default: 0 }   // 📊 total number of reviews
});

module.exports = mongoose.model('Medicine', MedicineSchema);
