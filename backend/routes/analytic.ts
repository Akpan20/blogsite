import express from 'express';
import { getPageViews, getEngagementMetrics, getDashboardStats } from '../controllers/analytic.ts';
import { authenticateToken } from '../middlewares/auth.ts';

const router = express.Router();

router.get('/page-views', authenticateToken, getPageViews);
router.get('/engagement', authenticateToken, getEngagementMetrics);
router.get('/stats', authenticateToken, getDashboardStats);

export default router;