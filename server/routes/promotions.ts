import { Router } from 'express';
import { promotionStorage } from '../services/jsonStorage.js';

const router = Router();

// Public: List active promotions
router.get('/', async (_req, res) => {
  try {
    const promos = await promotionStorage.find((p) => p.isActive);
    res.json({ promotions: promos });
  } catch (err) {
    console.error('Fetch promotions error:', err);
    res.status(500).json({ error: 'Failed to retrieve promotions.' });
  }
});

// Validate promotion coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotalLkr } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Promo code is required.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = await promotionStorage.findOne((p) => p.code.toUpperCase() === cleanCode && p.isActive);

    if (!promo) {
      res.status(404).json({ valid: false, error: 'Invalid or expired promotional code.' });
      return;
    }

    const now = new Date();
    if (new Date(promo.validUntil) < now) {
      res.status(400).json({ valid: false, error: 'This coupon code has expired.' });
      return;
    }

    const currentSubtotal = Number(subtotalLkr) || 0;
    if (currentSubtotal < promo.minOrderLkr) {
      res.status(400).json({
        valid: false,
        error: `Order minimum of LKR ${promo.minOrderLkr} required for this code. Your current subtotal is LKR ${currentSubtotal}.`,
      });
      return;
    }

    let calculatedDiscountLkr = 0;
    if (promo.discountType === 'percentage') {
      const rawDiscount = Math.round((currentSubtotal * promo.discountValue) / 100);
      calculatedDiscountLkr = promo.maxDiscountLkr ? Math.min(rawDiscount, promo.maxDiscountLkr) : rawDiscount;
    } else {
      calculatedDiscountLkr = Math.min(promo.discountValue, currentSubtotal);
    }

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountLkr: calculatedDiscountLkr,
      description: promo.description,
    });
  } catch (err) {
    console.error('Validate promo error:', err);
    res.status(500).json({ error: 'Failed to validate promo code.' });
  }
});

export default router;
