import { Router } from 'express';
import { menuItemStorage, restaurantStorage } from '../services/jsonStorage.js';
import { authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import type { MenuItem } from '../../src/types/index.js';

const router = Router();

// Public: Get menu items by restaurant ID
router.get('/', async (req, res) => {
  try {
    const { restaurantId, category, search } = req.query;

    let items = await menuItemStorage.getAll();

    if (restaurantId && typeof restaurantId === 'string') {
      items = items.filter((item) => item.restaurantId === restaurantId);
    }

    if (category && typeof category === 'string') {
      items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      items = items.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }

    res.json({
      count: items.length,
      menuItems: items,
    });
  } catch (err) {
    console.error('Fetch menu items error:', err);
    res.status(500).json({ error: 'Failed to retrieve menu items.' });
  }
});

// Public: Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const item = await menuItemStorage.getById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Menu item not found.' });
      return;
    }
    res.json({ menuItem: item });
  } catch (err) {
    console.error('Fetch menu item error:', err);
    res.status(500).json({ error: 'Failed to retrieve menu item.' });
  }
});

// Owner or Admin: Create menu item
router.post('/', authenticateToken, requireRole(['restaurant_owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      restaurantId,
      name,
      description,
      priceLkr,
      category,
      imageUrl,
      isVegetarian,
      isSpicy,
      isHalal,
      preparationTimeMinutes,
      customizationOptions,
    } = req.body;

    if (!restaurantId || !name || priceLkr === undefined) {
      res.status(400).json({ error: 'Restaurant ID, name, and price (LKR) are required.' });
      return;
    }

    // Check ownership if owner
    const restaurant = await restaurantStorage.getById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: 'Associated restaurant not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && restaurant.ownerId !== req.user!.id) {
      res.status(403).json({ error: 'You do not own this restaurant.' });
      return;
    }

    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      restaurantId,
      name: name.trim(),
      description: description || '',
      priceLkr: Math.max(0, Number(priceLkr)),
      category: category || 'Main Dishes',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isVegetarian: Boolean(isVegetarian),
      isSpicy: Boolean(isSpicy),
      isHalal: isHalal !== undefined ? Boolean(isHalal) : true,
      preparationTimeMinutes: preparationTimeMinutes ? Number(preparationTimeMinutes) : 15,
      customizationOptions: Array.isArray(customizationOptions) ? customizationOptions : [],
      createdAt: new Date().toISOString(),
    };

    await menuItemStorage.create(newItem);
    res.status(201).json({ message: 'Menu item created successfully', menuItem: newItem });
  } catch (err) {
    console.error('Create menu item error:', err);
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
});

// Update menu item
router.put('/:id', authenticateToken, requireRole(['restaurant_owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await menuItemStorage.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Menu item not found.' });
      return;
    }

    const restaurant = await restaurantStorage.getById(existing.restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: 'Associated restaurant not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && restaurant.ownerId !== req.user!.id) {
      res.status(403).json({ error: 'You do not own this restaurant.' });
      return;
    }

    const updated = await menuItemStorage.update(req.params.id, req.body);
    res.json({ message: 'Menu item updated successfully', menuItem: updated });
  } catch (err) {
    console.error('Update menu item error:', err);
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

// Delete menu item
router.delete('/:id', authenticateToken, requireRole(['restaurant_owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await menuItemStorage.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Menu item not found.' });
      return;
    }

    const restaurant = await restaurantStorage.getById(existing.restaurantId);
    if (restaurant && req.user!.role !== 'admin' && restaurant.ownerId !== req.user!.id) {
      res.status(403).json({ error: 'You do not own this restaurant.' });
      return;
    }

    await menuItemStorage.delete(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

export default router;
