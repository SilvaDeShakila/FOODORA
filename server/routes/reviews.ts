import { Router } from 'express';
import { reviewStorage, restaurantStorage } from '../services/jsonStorage.js';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import type { Review } from '../../src/types/index.js';

const router = Router();

// Public: Get reviews for a specific restaurant
router.get('/restaurant/:id', async (req, res) => {
  try {
    const reviews = await reviewStorage.find((r) => r.restaurantId === req.params.id);
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ count: reviews.length, reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// Customer: Submit review
router.post('/restaurant/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const restaurantId = req.params.id;
    const { rating, comment, orderId } = req.body;

    const restaurant = await restaurantStorage.getById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found.' });
      return;
    }

    const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      res.status(400).json({ error: 'Review comment must be at least 3 characters long.' });
      return;
    }

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurantId,
      customerId: req.user!.id,
      customerName: req.user!.name,
      orderId,
      rating: numericRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    await reviewStorage.create(newReview);

    // Update restaurant rating average
    const allReviews = await reviewStorage.find((r) => r.restaurantId === restaurantId);
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / allReviews.length).toFixed(1));

    await restaurantStorage.update(restaurantId, {
      rating: avg,
      reviewCount: allReviews.length,
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview,
      updatedRestaurantRating: avg,
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

export default router;
