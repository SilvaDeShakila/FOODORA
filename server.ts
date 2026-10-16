import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './server/config/index.js';

// Route imports
import authRoutes from './server/routes/auth.js';
import restaurantRoutes from './server/routes/restaurants.js';
import menuItemRoutes from './server/routes/menuItems.js';
import orderRoutes from './server/routes/orders.js';
import reviewRoutes from './server/routes/reviews.js';
import userRoutes from './server/routes/users.js';
import ownerRoutes from './server/routes/owner.js';
import riderRoutes from './server/routes/rider.js';
import adminRoutes from './server/routes/admin.js';
import promotionRoutes from './server/routes/promotions.js';
import notificationRoutes from './server/routes/notifications.js';
import healthRoutes from './server/routes/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger in dev
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Mount API Endpoints
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/menu-items', menuItemRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/owner', ownerRoutes);
  app.use('/api/rider', riderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/promotions', promotionRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Central API error handler
  app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({
      error: 'An unexpected internal error occurred.',
      message: err.message,
    });
  });

  // Serve Frontend
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = config.port;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FOODORA server running on http://0.0.0.0:${PORT}`);
    console.log(`📍 Market: Sri Lanka (LKR)`);
    console.log(`📦 Data storage: Persistent JSON files in server/data/`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
