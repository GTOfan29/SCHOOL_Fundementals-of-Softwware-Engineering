const MenuItem = require('../models/MenuItem');

class MenuController {
  async getAllItems(req, res) {
    try {
      const items = await MenuItem.getAllItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getItemsByCategory(req, res) {
    try {
      const { category } = req.params;
      const items = await MenuItem.getItemsByCategory(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MenuController();
