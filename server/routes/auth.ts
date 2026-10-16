import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userStorage } from '../services/jsonStorage.js';
import { config } from '../config/index.js';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import type { UserWithPassword, User } from '../../src/types/index.js';

const router = Router();

function sanitizeUser(user: UserWithPassword): User {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Register (Customer only for public registration)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Full name must be at least 2 characters.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      res.status(400).json({ error: 'Valid phone number is required (e.g., +94 77 123 4567).' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await userStorage.findOne((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserWithPassword = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'customer', // Public registration is strictly customer
      status: 'active',
      passwordHash,
      createdAt: new Date().toISOString(),
      addresses: [],
    };

    await userStorage.create(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userStorage.findOne((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Switch Demo Persona (Convenience endpoint for evaluating role workflows)
router.post('/demo-switch', async (req, res) => {
  try {
    const { role } = req.body;
    let targetEmail = 'customer@foodora.lk';
    if (role === 'restaurant_owner') targetEmail = 'owner@foodora.lk';
    else if (role === 'rider') targetEmail = 'rider@foodora.lk';
    else if (role === 'admin') targetEmail = 'admin@foodora.lk';
    else if (role === 'customer_kandy') targetEmail = 'dilani@foodora.lk';

    const user = await userStorage.findOne((u) => u.email === targetEmail);
    if (!user) {
      res.status(404).json({ error: `Demo account for role ${role} not found.` });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Demo switch error:', err);
    res.status(500).json({ error: 'Failed to switch demo account.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userStorage.getById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

// Logout
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
