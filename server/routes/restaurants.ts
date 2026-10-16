import { Router } from 'express';
import { restaurantStorage, menuItemStorage, reviewStorage } from '../services/jsonStorage.js';
import { authenticateToken, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import type { Restaurant } from '../../src/types/index.js';

const router = Router();

// Public: List and search restaurants with filtering & sorting
router.get('/', async (req, res) => {
  try {
    const {
      search,
      cuisine,
      city,
      district,
      minRating,
      maxDeliveryFee,
      maxDeliveryTime,
      sortBy,
      featured,
    } = req.query;

    let restaurants = await restaurantStorage.find((r) => r.status === 'approved');

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      restaurants = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.tagline.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (cuisine && typeof cuisine === 'string') {
      const targetCuisine = cuisine.toLowerCase();
      restaurants = restaurants.filter((r) =>
        r.cuisine.some((c) => c.toLowerCase() === targetCuisine)
      );
    }

    if (city && typeof city === 'string') {
      const targetCity = city.toLowerCase();
      restaurants = restaurants.filter((r) => r.city.toLowerCase().includes(targetCity));
    }

    if (district && typeof district === 'string') {
      const targetDist = district.toLowerCase();
      restaurants = restaurants.filter((r) => r.district.toLowerCase() === targetDist);
    }

    if (minRating) {
      const min = parseFloat(minRating as string);
      if (!isNaN(min)) {
        restaurants = restaurants.filter((r) => r.rating >= min);
      }
    }

    if (maxDeliveryFee) {
      const maxFee = parseFloat(maxDeliveryFee as string);
      if (!isNaN(maxFee)) {
        restaurants = restaurants.filter((r) => r.deliveryFeeLkr <= maxFee);
      }
    }

    if (maxDeliveryTime) {
      const maxTime = parseInt(maxDeliveryTime as string, 10);
      if (!isNaN(maxTime)) {
        restaurants = restaurants.filter((r) => r.deliveryTimeMax <= maxTime);
      }
    }

    if (featured === 'true') {
      restaurants = restaurants.filter((r) => r.featured);
    }

    // Sort
    if (sortBy === 'rating') {
      restaurants.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'deliveryTime') {
      restaurants.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
    } else if (sortBy === 'deliveryFee') {
      restaurants.sort((a, b) => a.deliveryFeeLkr - b.deliveryFeeLkr);
    } else if (sortBy === 'popular') {
      restaurants.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // Default: featured first, then highest rating
      restaurants.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
    }

    res.json({
      count: restaurants.length,
      restaurants,
    });
  } catch (err) {
    console.error('List restaurants error:', err);
    res.status(500).json({ error: 'Failed to retrieve restaurants.' });
  }
});

// Public: Get single restaurant by ID with its reviews and categories
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await restaurantStorage.getById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found.' });
      return;
    }

    const items = await menuItemStorage.find((item) => item.restaurantId === restaurant.id);
    const reviews = await reviewStorage.find((rev) => rev.restaurantId === restaurant.id);
    const categories = Array.from(new Set(items.map((i) => i.category)));

    res.json({
      restaurant,
      categories,
      menuCount: items.length,
      reviewsCount: reviews.length,
      recentReviews: reviews.slice(0, 5),
    });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ error: 'Failed to retrieve restaurant details.' });
  }
});

// Owner or Admin: Create new restaurant
router.post('/', authenticateToken, requireRole(['restaurant_owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      name,
      tagline,
      description,
      logoUrl,
      coverImageUrl,
      address,
      city,
      district,
      cuisine,
      deliveryTimeMin,
      deliveryTimeMax,
      deliveryFeeLkr,
      minOrderLkr,
      phone,
      openHours,
    } = req.body;

    if (!name || !address || !city) {
      res.status(400).json({ error: 'Restaurant name, address, and city are required.' });
      return;
    }

    const newRestaurant: Restaurant = {
      id: `rest_${Date.now()}`,
      ownerId: req.user!.id,
      name: name.trim(),
      tagline: tagline || 'Finest Sri Lankan cuisine',
      description: description || '',
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80',
      coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      address: address.trim(),
      city: city.trim(),
      district: district || 'Colombo',
      cuisine: Array.isArray(cuisine) && cuisine.length > 0 ? cuisine : ['Sri Lankan'],
      rating: 5.0,
      reviewCount: 0,
      deliveryTimeMin: deliveryTimeMin ? Number(deliveryTimeMin) : 25,
      deliveryTimeMax: deliveryTimeMax ? Number(deliveryTimeMax) : 40,
      deliveryFeeLkr: deliveryFeeLkr !== undefined ? Number(deliveryFeeLkr) : 200,
      minOrderLkr: minOrderLkr !== undefined ? Number(minOrderLkr) : 800,
      isOpen: true,
      status: req.user!.role === 'admin' ? 'approved' : 'pending',
      featured: false,
      phone: phone || '+94 11 000 0000',
      openHours: openHours || '10:00 AM - 10:00 PM',
      createdAt: new Date().toISOString(),
      lat: req.body.lat !== undefined ? Number(req.body.lat) : 6.9271,
      lng: req.body.lng !== undefined ? Number(req.body.lng) : 79.8612,
    };

    await restaurantStorage.create(newRestaurant);
    res.status(201).json({ message: 'Restaurant created successfully', restaurant: newRestaurant });
  } catch (err) {
    console.error('Create restaurant error:', err);
    res.status(500).json({ error: 'Failed to create restaurant.' });
  }
});

// Update restaurant
router.put('/:id', authenticateToken, requireRole(['restaurant_owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await restaurantStorage.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Restaurant not found.' });
      return;
    }

    // Must be the owner or admin
    if (req.user!.role !== 'admin' && existing.ownerId !== req.user!.id) {
      res.status(403).json({ error: 'You are not authorized to update this restaurant.' });
      return;
    }

    const updated = await restaurantStorage.update(req.params.id, req.body);
    res.json({ message: 'Restaurant updated successfully', restaurant: updated });
  } catch (err) {
    console.error('Update restaurant error:', err);
    res.status(500).json({ error: 'Failed to update restaurant.' });
  }
});

// Delete restaurant (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const success = await restaurantStorage.delete(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Restaurant not found.' });
      return;
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    console.error('Delete restaurant error:', err);
    res.status(500).json({ error: 'Failed to delete restaurant.' });
  }
});

export default router;
