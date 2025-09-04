const OrderItem = require('../models/OrderItem');

class OrderController {
  async createOrder(req, res) {
    try {
      const { itemId, quantity, tableNum, notes } = req.body;
      const order = await OrderItem.create(itemId, quantity, tableNum, notes);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async submitOrder(req, res) {
    try {
      const { tableNumber, items, note } = req.body;
      
      // Tüm siparişleri sırayla oluştur
      const orderPromises = items.map(item => 
        OrderItem.create(item.itemId, item.quantity, tableNumber, note)
      );
      
      // Tüm siparişleri bekle
      const orders = await Promise.all(orderPromises);
      
      res.status(201).json({
        success: true,
        message: 'Sipariş başarıyla oluşturuldu',
        orders: orders
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Sipariş oluşturulurken bir hata oluştu'
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { itemId, tableNum } = req.params;
      const { status, created_at } = req.body;
      const order = await OrderItem.updateStatus(itemId, tableNum, created_at, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrdersByTable(req, res) {
    try {
      const { tableNum } = req.params;
      const orders = await OrderItem.getOrdersByTable(tableNum);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPendingOrders(req, res) {
    try {
      const orders = await OrderItem.getAllPendingOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();
