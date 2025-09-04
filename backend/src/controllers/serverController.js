const OrderItem = require('../models/OrderItem');

class ServerController {
  async getReadyOrders(req, res) {
    try {
      const orders = await OrderItem.getReadyOrdersByTable();
      
      // Group orders by table
      const groupedOrders = orders.reduce((acc, order) => {
        if (!acc[order.table_num]) {
          acc[order.table_num] = [];
        }
        acc[order.table_num].push({
          id: order.item_id,
          name: order.name,
          quantity: order.quantity,
          status: order.status,
          notes: order.notes,
          createdAt: order.created_at
        });
        return acc;
      }, {});

      // Convert to array format
      const result = Object.entries(groupedOrders).map(([tableNum, items]) => ({
        tableNumber: tableNum,
        items
      }));

      res.json(result);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      res.status(500).json({ error: 'Failed to fetch ready orders' });
    }
  }

  async completeOrder(req, res) {
    try {
      const { itemId, tableNum } = req.params;
      const { created_at } = req.body;

      const updatedOrder = await OrderItem.updateStatus(itemId, tableNum, created_at, 'completed');
      
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error completing order:', error);
      res.status(500).json({ error: 'Failed to complete order' });
    }
  }
}

module.exports = new ServerController(); 