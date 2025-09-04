const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/items', menuController.getAllItems);
router.get('/items/:category', menuController.getItemsByCategory);

module.exports = router;
