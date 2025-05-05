const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [ // Renamed from 'medicines' to 'items' to match the function
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // Renamed from priceEach to price to match the function
    }
  ],
  totalAmount: { type: Number, required: true },
  address: { type: Object, required: true }, // To store the address as an object
  paymentType: { type: String, enum: ['COD'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: String,
  orderstatus: { type: String, enum: ['pending', 'Confirmed','cancelled'], default: 'pending' },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Order', OrderSchema);
