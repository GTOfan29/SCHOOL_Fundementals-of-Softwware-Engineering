const pool = require('../config/database');

class OrderItem {
  static async create(itemId, quantity, tableNum, notes = '') {
    // Create new order with created_at timestamp
    const insertQuery = `
      INSERT INTO order_items (item_id, quantity, table_num, notes, status, created_at)
      VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [itemId, quantity, tableNum, notes]);
    return rows[0];
  }

  static async updateStatus(itemId, tableNum, created_at, status) {
    try {
      // First, let's check the actual created_at value in the database
      const checkQuery = `
        SELECT created_at 
        FROM order_items 
        WHERE item_id = $1 AND table_num = $2
      `;
      const checkResult = await pool.query(checkQuery, [itemId, tableNum]);
      console.log('Found order with created_at:', checkResult.rows[0]?.created_at);

      // Update using a time range comparison (within 1 second)
      const query = `
        UPDATE order_items 
        SET status = $1 
        WHERE item_id = $2 
        AND table_num = $3 
        AND created_at >= ($4::timestamp - interval '1 second')
        AND created_at <= ($4::timestamp + interval '1 second')
        RETURNING *
      `;
      
      console.log('Updating status with params:', { status, itemId, tableNum, created_at });
      const { rows } = await pool.query(query, [status, itemId, tableNum, created_at]);
      console.log('Update result:', rows);
      
      if (rows.length === 0) {
        // If no rows were updated, try without the timestamp condition
        const fallbackQuery = `
          UPDATE order_items 
          SET status = $1 
          WHERE item_id = $2 
          AND table_num = $3
          AND status = 'ready'
          RETURNING *
        `;
        console.log('Trying fallback update...');
        const fallbackResult = await pool.query(fallbackQuery, [status, itemId, tableNum]);
        console.log('Fallback update result:', fallbackResult.rows);
        return fallbackResult.rows[0];
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  static async getOrdersByTable(tableNum) {
    const query = `
      SELECT oi.*, mi.name, mi.price 
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.table_num = $1 AND oi.status != 'completed'
      ORDER BY oi.created_at DESC
    `;
    const { rows } = await pool.query(query, [tableNum]);
    return rows;
  }

  static async getAllPendingOrders() {
    const query = `
      SELECT oi.*, mi.name, mi.price 
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.status = 'pending'
      ORDER BY oi.created_at ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getAllOrders() {
    const query = `
      SELECT 
        oi.*,
        mi.name,
        mi.price,
        mi.category
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.status IN ('pending', 'preparing', 'ready')
      ORDER BY oi.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getReadyOrdersByTable() {
    const query = `
      SELECT 
        oi.*,
        mi.name,
        mi.price,
        mi.category
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.status = 'ready'
      ORDER BY oi.table_num, oi.created_at ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async updateOrderStatus(itemId, tableNum, status) {
    const query = `
      UPDATE order_items 
      SET status = $1 
      WHERE item_id = $2 AND table_num = $3
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, itemId, tableNum]);
    return rows[0];
  }
}

module.exports = OrderItem;
