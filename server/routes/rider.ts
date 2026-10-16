import { Router } from 'express';
import { orderStorage, notificationStorage, userStorage } from '../services/jsonStorage.js';
import { authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { broadcastOrderStatus, broadcastRiderLocation, broadcastNotification } from '../services/socketService.js';
import type { OrderStatus, RiderLocation } from '../../src/types/index.js';

const router = Router();

router.use(authenticateToken, requireRole(['rider', 'admin']));

// Rider dashboard overview
router.get('/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    const riderId = req.user!.id;
    const allOrders = await orderStorage.getAll();
    const user = await userStorage.getById(riderId);

    const myOrders = allOrders.filter((o) => o.riderId === riderId);
    const activeOrders = myOrders.filter((o) => o.status === 'picked_up' || o.status === 'on_the_way');
    const completedOrders = myOrders.filter((o) => o.status === 'delivered');

    // Demo earnings calculation: LKR 200 base per delivery + 50 tip allowance
    const totalDeliveries = completedOrders.length;
    const demoTotalEarningsLkr = totalDeliveries * 250;

    // Available tasks looking for a rider
    const availableTasks = allOrders.filter(
      (o) => (o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready_for_pickup') && !o.riderId
    );

    res.json({
      metrics: {
        totalDeliveries,
        activeOrdersCount: activeOrders.length,
        availableTasksCount: availableTasks.length,
        demoTotalEarningsLkr,
        isOnline: user?.isOnline ?? true,
        lastLocation: user?.lastLocation,
      },
      activeOrders,
      availableTasks,
      completedOrders: completedOrders.slice(0, 10),
    });
  } catch (err) {
    console.error('Rider dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve rider dashboard.' });
  }
});

// Toggle rider online availability
router.patch('/availability', async (req: AuthenticatedRequest, res) => {
  try {
    const riderId = req.user!.id;
    const { isOnline } = req.body;

    const updatedUser = await userStorage.update(riderId, {
      isOnline: Boolean(isOnline),
    });

    res.json({
      message: `Rider is now ${isOnline ? 'Online and available for deliveries' : 'Offline'}`,
      isOnline: updatedUser?.isOnline,
    });
  } catch (err) {
    console.error('Toggle rider availability error:', err);
    res.status(500).json({ error: 'Failed to update rider availability status.' });
  }
});

// Get rider orders (available + assigned)
router.get('/orders', async (req: AuthenticatedRequest, res) => {
  try {
    const riderId = req.user!.id;
    const allOrders = await orderStorage.getAll();

    const assigned = allOrders.filter((o) => o.riderId === riderId);
    const available = allOrders.filter(
      (o) => (o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready_for_pickup') && !o.riderId
    );

    res.json({ assigned, available });
  } catch (err) {
    console.error('Fetch rider orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve rider orders.' });
  }
});

// Accept a delivery task
router.patch('/orders/:id/accept', async (req: AuthenticatedRequest, res) => {
  try {
    const order = await orderStorage.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.riderId && order.riderId !== req.user!.id) {
      res.status(400).json({ error: 'This delivery task has already been accepted by another rider.' });
      return;
    }

    const now = new Date().toISOString();
    const updated = await orderStorage.update(order.id, {
      riderId: req.user!.id,
      riderName: req.user!.name,
      riderPhone: '+94 72 456 7890',
      updatedAt: now,
    });

    if (updated) {
      // Notify customer
      const notif = {
        id: `notif_${Date.now()}`,
        userId: order.customerId,
        title: 'Rider Assigned! 🛵',
        message: `${req.user!.name} has accepted your order from ${order.restaurantName}.`,
        type: 'rider' as const,
        read: false,
        link: `/orders/${order.id}`,
        createdAt: now,
      };
      await notificationStorage.create(notif);
      broadcastNotification(order.customerId, notif);
      broadcastOrderStatus(updated);
    }

    res.json({ message: 'Delivery task accepted successfully', order: updated });
  } catch (err) {
    console.error('Accept task error:', err);
    res.status(500).json({ error: 'Failed to accept delivery task.' });
  }
});

// Update delivery status ('picked_up', 'on_the_way', 'delivered')
router.patch('/orders/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { status, message } = req.body;
    const order = await orderStorage.getById(req.params.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.riderId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You are not the assigned rider for this order.' });
      return;
    }

    const validRiderStatuses: OrderStatus[] = ['picked_up', 'on_the_way', 'delivered'];
    if (!validRiderStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status for rider update: ${status}` });
      return;
    }

    const now = new Date().toISOString();
    const defaultMessages: Record<string, string> = {
      picked_up: `Order collected from ${order.restaurantName} by rider ${req.user!.name}.`,
      on_the_way: `Rider ${req.user!.name} is navigating to delivery destination.`,
      delivered: `Delivered safely to customer. Payment status: ${order.paymentMethod === 'cod' ? 'Cash collected' : 'Prepaid'}.`,
    };

    const note = message || defaultMessages[status] || `Status updated to ${status}`;

    const updatedTimeline = [
      ...order.timeline,
      {
        status: status as OrderStatus,
        timestamp: now,
        message: note,
      },
    ];

    const updated = await orderStorage.update(order.id, {
      status,
      paymentStatus: status === 'delivered' ? 'paid' : order.paymentStatus,
      updatedAt: now,
      timeline: updatedTimeline,
    });

    if (updated) {
      // Notify customer
      const notif = {
        id: `notif_${Date.now()}`,
        userId: order.customerId,
        title: status === 'delivered' ? 'Order Delivered! 🎉' : 'Delivery Update 🛵',
        message: note,
        type: 'order' as const,
        read: false,
        link: `/orders/${order.id}`,
        createdAt: now,
      };
      await notificationStorage.create(notif);
      broadcastNotification(order.customerId, notif);
      broadcastOrderStatus(updated);
    }

    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    console.error('Rider status update error:', err);
    res.status(500).json({ error: 'Failed to update delivery status.' });
  }
});

// Publish Live Rider GPS Location (Authenticated, scoped to active order)
router.post('/orders/:id/location', async (req: AuthenticatedRequest, res) => {
  try {
    const orderId = req.params.id;
    const { lat, lng, heading, speed, accuracy } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Valid numerical latitude and longitude are required.' });
      return;
    }

    // Latitude range -90..90, Longitude range -180..180
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: 'Coordinates are out of geographic range.' });
      return;
    }

    const order = await orderStorage.getById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // Security check: Rider must be assigned to this order, or admin
    if (order.riderId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You are not assigned to this delivery.' });
      return;
    }

    // Only allow location updates if order is active
    if (order.status !== 'picked_up' && order.status !== 'on_the_way' && order.status !== 'ready_for_pickup') {
      res.status(400).json({ error: `Cannot update location for order with status "${order.status}".` });
      return;
    }

    const now = new Date().toISOString();
    const location: RiderLocation = {
      lat,
      lng,
      heading: typeof heading === 'number' ? heading : undefined,
      speed: typeof speed === 'number' ? speed : undefined,
      accuracy: typeof accuracy === 'number' ? accuracy : undefined,
      updatedAt: now,
    };

    // Maintain limited location history (max 25 entries to prevent JSON bloat)
    const currentHistory = order.locationHistory || [];
    const updatedHistory = [...currentHistory.slice(-24), { lat, lng, timestamp: now }];

    const updatedOrder = await orderStorage.update(order.id, {
      riderLocation: location,
      locationHistory: updatedHistory,
      updatedAt: now,
    });

    // Update rider's last known location
    await userStorage.update(req.user!.id, {
      lastLocation: { lat, lng, updatedAt: now },
    });

    // Broadcast live location over Socket.IO to the authorized order tracking room
    broadcastRiderLocation(order.id, location);

    res.json({
      message: 'Rider location updated successfully',
      location,
      orderId: order.id,
    });
  } catch (err) {
    console.error('Publish location error:', err);
    res.status(500).json({ error: 'Failed to record rider location.' });
  }
});

export default router;
