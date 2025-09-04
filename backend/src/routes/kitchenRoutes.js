const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');

router.get('/orders', kitchenController.getAllOrders);
router.put('/orders/:itemId/:tableNum/status', kitchenController.updateOrderStatus);

module.exports = router; 