// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware'); // Your JWT middleware

router.post('/add', auth, cartController.addtocart);
router.get('/view', auth, cartController.getCart);
router.post('/remove', auth, cartController.removeItem);

module.exports = router;