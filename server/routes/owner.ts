import { Router } from 'express';
import {
  restaurantStorage,
  orderStorage,
  menuItemStorage,
  notificationStorage,
} from '../services/jsonStorage.js';
import { authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import type { OrderStatus } from '../../src/types/index.js';

const router = Router();

// Apply owner or admin guard
router.use(authenticateToken, requireRole(['restaurant_owner', 'admin']));

// Get owner dashboard metrics
router.get('/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    const ownerId = req.user!.id;
    const isSuperAdmin = req.user!.role === 'admin';

    // Find restaurants belonging to this owner
    const allRestaurants = await restaurantStorage.getAll();
    const myRestaurants = isSuperAdmin
      ? allRestaurants
      : allRestaurants.filter((r) => r.ownerId === ownerId);

    const restaurantIds = myRestaurants.map((r) => r.id);

    // Find orders
    const allOrders = await orderStorage.getAll();
    const myOrders = allOrders.filter((o) => restaurantIds.includes(o.restaurantId));

    // Calculate revenue & statistics
    const totalOrders = myOrders.length;
    const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');
    const totalRevenueLkr = deliveredOrders.reduce((sum, o) => sum + o.subtotalLkr, 0);
    const activeOrdersCount = myOrders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    ).length;

    // Menu item stats
    const allMenuItems = await menuItemStorage.getAll();
    const myMenuItems = allMenuItems.filter((m) => restaurantIds.includes(m.restaurantId));

    res.json({
      metrics: {
        totalRestaurants: myRestaurants.length,
        totalOrders,
        activeOrdersCount,
        totalRevenueLkr,
        menuItemsCount: myMenuItems.length,
      },
      restaurants: myRestaurants,
      recentOrders: myOrders.slice(0, 10),
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch owner dashboard.' });
  }
});

// Get owner orders
router.get('/orders', async (req: AuthenticatedRequest, res) => {
  try {
    const ownerId = req.user!.id;
    const isSuperAdmin = req.user!.role === 'admin';

    const allRestaurants = await restaurantStorage.getAll();
    const myRestaurants = isSuperAdmin
      ? allRestaurants
      : allRestaurants.filter((r) => r.ownerId === ownerId);

    const restaurantIds = myRestaurants.map((r) => r.id);
    const allOrders = await orderStorage.getAll();
    const myOrders = allOrders.filter((o) => restaurantIds.includes(o.restaurantId));
    myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ orders: myOrders });
  } catch (err) {
    console.error('Owner orders error:', err);
    res.status(500).json({ error: 'Failed to fetch owner orders.' });
  }
});

// Update order status (Owner lifecycle transitions)
router.patch('/orders/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { status, message } = req.body;
    const order = await orderStorage.getById(req.params.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const restaurant = await restaurantStorage.getById(order.restaurantId);
    if (req.user!.role !== 'admin' && restaurant?.ownerId !== req.user!.id) {
      res.status(403).json({ error: 'You do not own the restaurant for this order.' });
      return;
    }

    const validOwnerStatuses: OrderStatus[] = ['confirmed', 'preparing', 'ready_for_pickup', 'cancelled'];
    if (!validOwnerStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status transition for restaurant owner: ${status}` });
      return;
    }

    const now = new Date().toISOString();
    const statusNote = message || `Order marked as ${status.replace(/_/g, ' ')} by restaurant.`;

    const updatedTimeline = [
      ...order.timeline,
      {
        status: status as OrderStatus,
        timestamp: now,
        message: statusNote,
      },
    ];

    const updated = await orderStorage.update(order.id, {
      status,
      updatedAt: now,
      timeline: updatedTimeline,
    });

    // Notify customer
    await notificationStorage.create({
      id: `notif_${Date.now()}`,
      userId: order.customerId,
      title: `Order Update: ${status.toUpperCase()} 🍛`,
      message: `${restaurant?.name || 'Restaurant'} updated your order status to "${status.replace(/_/g, ' ')}".`,
      type: 'order',
      read: false,
      link: `/orders/${order.id}`,
      createdAt: now,
    });

    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    console.error('Update owner order status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Toggle restaurant open status
router.patch('/restaurants/:id/toggle-open', async (req: AuthenticatedRequest, res) => {
  try {
    const restaurant = await restaurantStorage.getById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && restaurant.ownerId !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized for this restaurant.' });
      return;
    }

    const updated = await restaurantStorage.update(restaurant.id, {
      isOpen: !restaurant.isOpen,
    });

    res.json({ message: 'Opening status updated', restaurant: updated });
  } catch (err) {
    console.error('Toggle restaurant open error:', err);
    res.status(500).json({ error: 'Failed to toggle status.' });
  }
});

// Get owner menu items
router.get('/menu', async (req: AuthenticatedRequest, res) => {
  try {
    const ownerId = req.user!.id;
    const isSuperAdmin = req.user!.role === 'admin';

    const allRestaurants = await restaurantStorage.getAll();
    const myRestaurants = isSuperAdmin
      ? allRestaurants
      : allRestaurants.filter((r) => r.ownerId === ownerId);

    const restaurantIds = myRestaurants.map((r) => r.id);
    const allMenuItems = await menuItemStorage.getAll();
    const myItems = allMenuItems.filter((m) => restaurantIds.includes(m.restaurantId));

    res.json({ menuItems: myItems, restaurants: myRestaurants });
  } catch (err) {
    console.error('Fetch owner menu error:', err);
    res.status(500).json({ error: 'Failed to retrieve menu items.' });
  }
});

export default router;
