import express from 'express';
import { authenticateToken } from '../middlewares/auth.ts';
import {
  createSubscription,
  getSubscriptions,
  getSubscribers
} from '../controllers/subscription.ts';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createSubscription);
router.get('/my-subscriptions', getSubscriptions);
router.get('/my-subscribers', getSubscribers);

export default router;