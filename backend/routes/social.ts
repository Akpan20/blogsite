import express from 'express';
import { authenticateToken } from '../middlewares/auth.ts';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/social.ts';

const router = express.Router();

// Public routes
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Protected routes
router.post('/follow', authenticateToken, followUser);
router.delete('/unfollow/:followingId', authenticateToken, unfollowUser);

export default router;