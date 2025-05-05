const Cart = require('../models/cart');
const Order = require('../models/order');
const Medicine = require('../models/medicine');
const User = require('../models/user');

exports.createOrder = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.medicineId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        const user = await User.findById(userId);
        const address = user.profile.address;
        const orderItems = cart.items.map(item => ({
            medicineId: item.medicineId._id,
            quantity: item.quantity,
            price: item.medicineId.price
        }));
        const totalAmount = orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

        const newOrder = new Order({
            userId,
            items: orderItems,
            totalAmount,
            address,
            status: 'pending'
        });
        await newOrder.save();
        await Cart.findOneAndDelete({ userId });

        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to place order' });
    }
};
exports.getUserOrders = async (req, res) => {
    const userId = req.user._id;

    try {
        const orders = await Order.find({ userId }).populate('medicines.medicineId');
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({orderstatus : 'Confirmed'}).populate('userId').populate('items.medicineId');
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch all orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
        return res.status(400).json({ message: "Order ID and new status are required." });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found." });

        order.status = newStatus;
        await order.save();

        res.status(200).json({ message: "Order status updated successfully.", order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status." });
    }
};
exports.getOrderById = async (req, res) => {
    const { orderId } = req.params;

    try {

        const order = await Order.findById(orderId)
            .populate('userId', 'name email profile') // select specific user fields
            .populate('items.medicineId'); // assuming `items` or `medicines` is used in your schema

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
};
exports.confirmOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        console.log("Affan",orderId)
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderstatus: 'Confirmed' },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order confirmed', order: updatedOrder });
    } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).json({ message: 'Failed to confirm order' });
    }
  };