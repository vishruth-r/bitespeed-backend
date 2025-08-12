import express from 'express';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint to verify the service is running properly
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

export default router;
