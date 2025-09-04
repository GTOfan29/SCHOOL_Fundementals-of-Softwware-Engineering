const pool = require('../config/database');

class MenuItem {
  static async getAllItems(retries = 3) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const query = 'SELECT * FROM menu_items ORDER BY category, name';
        const client = await pool.connect();
        
        try {
          const { rows } = await client.query(query);
          console.log(`Successfully fetched ${rows.length} menu items`);
          return rows;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} failed to fetch menu items:`, error);
        lastError = error;
        
        if (i < retries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw new Error(`Failed to fetch menu items after ${retries} attempts. Last error: ${lastError.message}`);
  }

  static async getItemsByCategory(category, retries = 3) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const query = 'SELECT * FROM menu_items WHERE category = $1 ORDER BY name';
        const client = await pool.connect();
        
        try {
          const { rows } = await client.query(query, [category]);
          console.log(`Successfully fetched ${rows.length} items for category: ${category}`);
          return rows;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} failed to fetch items for category ${category}:`, error);
        lastError = error;
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw new Error(`Failed to fetch items for category ${category} after ${retries} attempts. Last error: ${lastError.message}`);
  }

  static async getItemById(itemId, retries = 3) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const query = 'SELECT * FROM menu_items WHERE item_id = $1';
        const client = await pool.connect();
        
        try {
          const { rows } = await client.query(query, [itemId]);
          if (rows.length === 0) {
            console.log(`No item found with ID: ${itemId}`);
            return null;
          }
          console.log(`Successfully fetched item with ID: ${itemId}`);
          return rows[0];
        } finally {
          client.release();
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} failed to fetch item ${itemId}:`, error);
        lastError = error;
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw new Error(`Failed to fetch item ${itemId} after ${retries} attempts. Last error: ${lastError.message}`);
  }
}

module.exports = MenuItem;
