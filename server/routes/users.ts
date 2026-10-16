import { Router } from 'express';
import { userStorage } from '../services/jsonStorage.js';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import type { Address } from '../../src/types/index.js';

const router = Router();

// Get profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userStorage.getById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update profile details
router.patch('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    const partial: Record<string, unknown> = {};

    if (name && typeof name === 'string') partial.name = name.trim();
    if (phone && typeof phone === 'string') partial.phone = phone.trim();
    if (avatarUrl && typeof avatarUrl === 'string') partial.avatarUrl = avatarUrl.trim();

    const updated = await userStorage.update(req.user!.id, partial);
    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Get saved addresses
router.get('/me/addresses', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userStorage.getById(req.user!.id);
    res.json({ addresses: user?.addresses || [] });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

// Add saved address
router.post('/me/addresses', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { label, addressLine, city, district, postalCode, landmark, isDefault } = req.body;

    if (!addressLine || !city) {
      res.status(400).json({ error: 'Address line and city are required.' });
      return;
    }

    const user = await userStorage.getById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      label: label || 'Home',
      addressLine: addressLine.trim(),
      city: city.trim(),
      district: district || 'Colombo',
      postalCode: postalCode ? String(postalCode).trim() : undefined,
      landmark: landmark ? String(landmark).trim() : undefined,
      isDefault: Boolean(isDefault) || user.addresses.length === 0,
    };

    let updatedAddresses = user.addresses || [];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    await userStorage.update(user.id, { addresses: updatedAddresses });
    res.status(201).json({ message: 'Address saved successfully', address: newAddress, addresses: updatedAddresses });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ error: 'Failed to add address.' });
  }
});

// Update saved address
router.patch('/me/addresses/:addressId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userStorage.getById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const addressIndex = user.addresses.findIndex((a) => a.id === req.params.addressId);
    if (addressIndex === -1) {
      res.status(404).json({ error: 'Address not found.' });
      return;
    }

    const currentAddresses = [...user.addresses];
    const isNowDefault = req.body.isDefault;

    if (isNowDefault) {
      currentAddresses.forEach((a) => (a.isDefault = false));
    }

    currentAddresses[addressIndex] = {
      ...currentAddresses[addressIndex],
      ...req.body,
    };

    await userStorage.update(user.id, { addresses: currentAddresses });
    res.json({ message: 'Address updated successfully', addresses: currentAddresses });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ error: 'Failed to update address.' });
  }
});

// Delete saved address
router.delete('/me/addresses/:addressId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userStorage.getById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const filtered = user.addresses.filter((a) => a.id !== req.params.addressId);
    await userStorage.update(user.id, { addresses: filtered });
    res.json({ message: 'Address deleted successfully', addresses: filtered });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});

export default router;
