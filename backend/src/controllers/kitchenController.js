const OrderItem = require('../models/OrderItem');

class KitchenController {
  async getAllOrders(req, res) {
    try {
      const orders = await OrderItem.getAllOrders();
      
      // Group orders by table
      const groupedOrders = orders.reduce((acc, order) => {
        const key = `${order.table_num}-${order.created_at}`;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            tableNumber: order.table_num,
            createdAt: order.created_at,
            items: []
          };
        }
        
        acc[key].items.push({
          id: order.item_id,
          name: order.name,
          quantity: order.quantity,
          status: order.status,
          notes: order.notes
        });

        return acc;
      }, {});

      // Convert to array and calculate overall status
      const formattedOrders = Object.values(groupedOrders).map(order => ({
        ...order,
        status: order.items.every(item => item.status === 'ready') 
          ? 'ready'
          : order.items.some(item => item.status === 'preparing')
            ? 'preparing'
            : 'pending'
      }));

      res.json(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { itemId, tableNum } = req.params;
      const { status } = req.body;

      if (!['pending', 'preparing', 'ready'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updatedOrder = await OrderItem.updateOrderStatus(itemId, tableNum, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
}

module.exports = new KitchenController(); 