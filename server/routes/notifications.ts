import { Router } from 'express';
import { notificationStorage } from '../services/jsonStorage.js';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Get user notifications
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const notifications = await notificationStorage.find((n) => n.userId === req.user!.id);
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// Mark single notification as read
router.patch('/:id/read', async (req: AuthenticatedRequest, res) => {
  try {
    const notification = await notificationStorage.getById(req.params.id);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }

    if (notification.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden.' });
      return;
    }

    const updated = await notificationStorage.update(notification.id, { read: true });
    res.json({ notification: updated });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// Mark all as read
router.post('/mark-all-read', async (req: AuthenticatedRequest, res) => {
  try {
    const userNotifications = await notificationStorage.find((n) => n.userId === req.user!.id);
    for (const notif of userNotifications) {
      if (!notif.read) {
        await notificationStorage.update(notif.id, { read: true });
      }
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

export default router;
