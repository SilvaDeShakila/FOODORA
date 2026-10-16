import { Router } from 'express';
import {
  userStorage,
  restaurantStorage,
  orderStorage,
  resetAllDataToSeed,
} from '../services/jsonStorage.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import type { RestaurantStatus, UserStatus } from '../../src/types/index.js';

const router = Router();

router.use(authenticateToken, requireRole(['admin']));

// Admin Overview Dashboard KPIs
router.get('/dashboard', async (_req, res) => {
  try {
    const users = await userStorage.getAll();
    const restaurants = await restaurantStorage.getAll();
    const orders = await orderStorage.getAll();

    const totalUsers = users.length;
    const totalRestaurants = restaurants.length;
    const approvedRestaurants = restaurants.filter((r) => r.status === 'approved').length;
    const totalOrders = orders.length;

    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const grossPlatformVolumeLkr = orders.reduce((sum, o) => sum + o.totalLkr, 0);
    const deliveredRevenueLkr = deliveredOrders.reduce((sum, o) => sum + o.totalLkr, 0);

    const ordersByStatus = {
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      on_the_way: orders.filter((o) => o.status === 'on_the_way' || o.status === 'picked_up').length,
      delivered: deliveredOrders.length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    const usersByRole = {
      customer: users.filter((u) => u.role === 'customer').length,
      restaurant_owner: users.filter((u) => u.role === 'restaurant_owner').length,
      rider: users.filter((u) => u.role === 'rider').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };

    res.json({
      metrics: {
        totalUsers,
        totalRestaurants,
        approvedRestaurants,
        totalOrders,
        grossPlatformVolumeLkr,
        deliveredRevenueLkr,
      },
      ordersByStatus,
      usersByRole,
      recentOrders: orders.slice(0, 10),
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin dashboard.' });
  }
});

// Get all users
router.get('/users', async (_req, res) => {
  try {
    const users = await userStorage.getAll();
    const safeUsers = users.map(({ passwordHash: _, ...rest }) => rest);
    res.json({ users: safeUsers });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== 'active' && status !== 'inactive') {
      res.status(400).json({ error: 'Status must be active or inactive.' });
      return;
    }

    const updated = await userStorage.update(req.params.id, { status: status as UserStatus });
    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: `User status changed to ${status}`, user: safeUser });
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// Get all restaurants
router.get('/restaurants', async (_req, res) => {
  try {
    const restaurants = await restaurantStorage.getAll();
    res.json({ restaurants });
  } catch (err) {
    console.error('Admin restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
});

// Approve or suspend restaurant
router.patch('/restaurants/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses: RestaurantStatus[] = ['approved', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const updated = await restaurantStorage.update(req.params.id, { status });
    if (!updated) {
      res.status(404).json({ error: 'Restaurant not found.' });
      return;
    }

    res.json({ message: `Restaurant status updated to ${status}`, restaurant: updated });
  } catch (err) {
    console.error('Update restaurant status error:', err);
    res.status(500).json({ error: 'Failed to update restaurant status.' });
  }
});

// Get all orders with filter
router.get('/orders', async (_req, res) => {
  try {
    const orders = await orderStorage.getAll();
    res.json({ orders });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Reset demo dataset
router.post('/reset-data', async (_req, res) => {
  try {
    await resetAllDataToSeed();
    res.json({ message: 'All demo data has been reset to default Sri Lankan sample dataset.' });
  } catch (err) {
    console.error('Reset data error:', err);
    res.status(500).json({ error: 'Failed to reset demo data.' });
  }
});

export default router;
