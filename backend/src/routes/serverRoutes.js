const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');

router.get('/ready-orders', serverController.getReadyOrders);
router.put('/complete-order/:itemId/:tableNum', serverController.completeOrder);

module.exports = router; 