const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required: true}  ,
    items: [{
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
      quantity: { type: Number, default: 1 }
    }],
    updatedAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('Cart', CartSchema);
