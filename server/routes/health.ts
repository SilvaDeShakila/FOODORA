import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FOODORA Sri Lanka Food Delivery API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    market: 'Sri Lanka (LKR)',
    persistence: 'Node.js JSON file storage',
  });
});

export default router;
