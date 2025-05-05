// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.post('/create', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/orders/:orderId', orderController.getOrderById);
router.put('/orders/confirm/:orderId', orderController.confirmOrder);

// Admin route (optional)
router.get('/all', orderController.getAllOrders); // Add admin check if needed
router.put('/update-status', orderController.updateOrderStatus); // PUT /api/orders/update-status

module.exports = router;
