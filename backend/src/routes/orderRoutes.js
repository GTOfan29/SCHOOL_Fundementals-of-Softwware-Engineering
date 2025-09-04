const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.post('/submit', orderController.submitOrder);
router.put('/:itemId/:tableNum/status', orderController.updateOrderStatus);
router.get('/table/:tableNum', orderController.getOrdersByTable);
router.get('/pending', orderController.getPendingOrders);

module.exports = router;
