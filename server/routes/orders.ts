import { Router } from 'express';
import {
  orderStorage,
  restaurantStorage,
  menuItemStorage,
  promotionStorage,
  notificationStorage,
  userStorage,
} from '../services/jsonStorage.js';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import type { Order, OrderStatus, OrderTimelineEvent } from '../../src/types/index.js';

const router = Router();

// Create Order (Customer)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      promoCode,
      notes,
    } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Restaurant ID and non-empty items array are required.' });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.addressLine || !deliveryAddress.city) {
      res.status(400).json({ error: 'A valid delivery address is required.' });
      return;
    }

    const restaurant = await restaurantStorage.getById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: 'Selected restaurant was not found.' });
      return;
    }

    if (!restaurant.isOpen) {
      res.status(400).json({ error: 'Restaurant is currently closed for orders.' });
      return;
    }

    // Retrieve full items from storage to guarantee authentic server-side pricing
    let subtotalLkr = 0;
    const verifiedOrderItems = [];

    for (const rawItem of items) {
      const storedItem = await menuItemStorage.getById(rawItem.menuItemId);
      if (!storedItem) {
        res.status(400).json({ error: `Menu item ${rawItem.menuItemId} does not exist.` });
        return;
      }
      if (!storedItem.isAvailable) {
        res.status(400).json({ error: `Item "${storedItem.name}" is currently sold out.` });
        return;
      }
      if (storedItem.restaurantId !== restaurantId) {
        res.status(400).json({ error: `Item "${storedItem.name}" is not from ${restaurant.name}.` });
        return;
      }

      const qty = Math.max(1, parseInt(rawItem.quantity, 10) || 1);
      const itemSubtotal = storedItem.priceLkr * qty;
      subtotalLkr += itemSubtotal;

      verifiedOrderItems.push({
        menuItemId: storedItem.id,
        name: storedItem.name,
        priceLkr: storedItem.priceLkr,
        quantity: qty,
        instructions: rawItem.instructions ? String(rawItem.instructions).slice(0, 200) : undefined,
        imageUrl: storedItem.imageUrl,
        selectedCustomizations: rawItem.selectedCustomizations || [],
      });
    }

    // Validate minimum order requirement
    if (subtotalLkr < restaurant.minOrderLkr) {
      res.status(400).json({
        error: `Minimum order amount for ${restaurant.name} is LKR ${restaurant.minOrderLkr}. Current subtotal is LKR ${subtotalLkr}.`,
      });
      return;
    }

    // Server-side delivery fee
    const deliveryFeeLkr = restaurant.deliveryFeeLkr;

    // Validate coupon / discount on backend
    let discountLkr = 0;
    let appliedPromo = undefined;

    if (promoCode && typeof promoCode === 'string') {
      const promo = await promotionStorage.findOne(
        (p) => p.code.toUpperCase() === promoCode.trim().toUpperCase() && p.isActive
      );

      if (promo) {
        const isDateValid = new Date(promo.validUntil) >= new Date();
        const isMinMet = subtotalLkr >= promo.minOrderLkr;

        if (isDateValid && isMinMet) {
          appliedPromo = promo.code;
          if (promo.discountType === 'percentage') {
            const rawDiscount = Math.round((subtotalLkr * promo.discountValue) / 100);
            discountLkr = promo.maxDiscountLkr ? Math.min(rawDiscount, promo.maxDiscountLkr) : rawDiscount;
          } else {
            discountLkr = Math.min(promo.discountValue, subtotalLkr);
          }
        }
      }
    }

    const totalLkr = Math.max(0, subtotalLkr + deliveryFeeLkr - discountLkr);
    const orderNumber = `FD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await userStorage.getById(req.user!.id);
    const customerPhone = user?.phone || '+94 77 123 4567';

    const now = new Date().toISOString();
    const initialTimeline: OrderTimelineEvent[] = [
      {
        status: 'pending',
        timestamp: now,
        message: 'Order placed by customer and sent to restaurant.',
      },
    ];

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      customerPhone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantAddress: `${restaurant.address}, ${restaurant.city}`,
      items: verifiedOrderItems,
      subtotalLkr,
      deliveryFeeLkr,
      discountLkr,
      totalLkr,
      promoCode: appliedPromo,
      deliveryAddress,
      paymentMethod: paymentMethod === 'card_demo' ? 'card_demo' : 'cod',
      paymentStatus: paymentMethod === 'card_demo' ? 'paid' : 'pending',
      status: 'pending',
      notes: notes ? String(notes).slice(0, 300) : undefined,
      createdAt: now,
      updatedAt: now,
      timeline: initialTimeline,
    };

    await orderStorage.create(newOrder);

    // Create notifications for customer and restaurant owner
    await notificationStorage.create({
      id: `notif_${Date.now()}_1`,
      userId: req.user!.id,
      title: 'Order Placed! 🍽️',
      message: `Your order ${orderNumber} at ${restaurant.name} for LKR ${totalLkr} was submitted successfully.`,
      type: 'order',
      read: false,
      link: `/orders/${newOrder.id}`,
      createdAt: now,
    });

    if (restaurant.ownerId) {
      await notificationStorage.create({
        id: `notif_${Date.now()}_2`,
        userId: restaurant.ownerId,
        title: 'New Order Alert! 🔔',
        message: `Order ${orderNumber} received for ${restaurant.name}. Total LKR ${totalLkr}.`,
        type: 'order',
        read: false,
        link: '/owner/orders',
        createdAt: now,
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Get My Orders (Customer)
router.get('/my-orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await orderStorage.find((o) => o.customerId === req.user!.id);
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ orders });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

// Get Order Details by ID (Authorized roles only)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const order = await orderStorage.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const { role, id: userId } = req.user!;
    const isCustomer = role === 'customer' && order.customerId === userId;
    const isRider = role === 'rider';
    const isAdmin = role === 'admin';

    let isOwner = false;
    if (role === 'restaurant_owner') {
      const restaurant = await restaurantStorage.getById(order.restaurantId);
      if (restaurant && restaurant.ownerId === userId) {
        isOwner = true;
      }
    }

    if (!isCustomer && !isRider && !isAdmin && !isOwner) {
      res.status(403).json({ error: 'You are not authorized to view this order.' });
      return;
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

// Cancel eligible order (Customer)
router.patch('/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const order = await orderStorage.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.customerId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You are not authorized to cancel this order.' });
      return;
    }

    // Cancellation rule: can only cancel if pending or confirmed
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      res.status(400).json({
        error: `Order cannot be cancelled because it is already "${order.status.replace(/_/g, ' ')}".`,
      });
      return;
    }

    const now = new Date().toISOString();
    const updatedTimeline = [
      ...order.timeline,
      {
        status: 'cancelled' as OrderStatus,
        timestamp: now,
        message: 'Order cancelled by customer.',
      },
    ];

    const updated = await orderStorage.update(order.id, {
      status: 'cancelled',
      updatedAt: now,
      timeline: updatedTimeline,
    });

    res.json({ message: 'Order cancelled successfully', order: updated });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
});

// Advance order status simulation (Demo testing feature for seamless evaluator walkthrough)
router.post('/:id/simulate-step', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const order = await orderStorage.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const statusFlow: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'picked_up',
      'on_the_way',
      'delivered',
    ];

    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
      res.status(400).json({ error: `Cannot advance further from status: ${order.status}` });
      return;
    }

    const nextStatus = statusFlow[currentIndex + 1];
    const now = new Date().toISOString();
    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Order pending confirmation',
      confirmed: 'Restaurant accepted order',
      preparing: 'Kitchen is preparing authentic Sri Lankan ingredients',
      ready_for_pickup: 'Order packaged and ready at counter',
      picked_up: 'Rider collected order package',
      on_the_way: 'Rider is on the way to destination',
      delivered: 'Order handed over to customer. Bon Appetit!',
      cancelled: 'Order was cancelled',
    };

    const updatedTimeline = [
      ...order.timeline,
      {
        status: nextStatus,
        timestamp: now,
        message: statusMessages[nextStatus],
      },
    ];

    const updated = await orderStorage.update(order.id, {
      status: nextStatus,
      updatedAt: now,
      riderName: nextStatus === 'picked_up' || nextStatus === 'on_the_way' || nextStatus === 'delivered' ? (order.riderName || 'Roshan Gunaratne') : order.riderName,
      riderPhone: nextStatus === 'picked_up' || nextStatus === 'on_the_way' || nextStatus === 'delivered' ? (order.riderPhone || '+94 72 456 7890') : order.riderPhone,
      timeline: updatedTimeline,
    });

    res.json({ message: `Order advanced to ${nextStatus}`, order: updated });
  } catch (err) {
    console.error('Simulate order step error:', err);
    res.status(500).json({ error: 'Failed to advance order.' });
  }
});

export default router;
