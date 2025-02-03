import express from 'express';
import { getUserProfile, updateUserProfile, deleteUser } from '../controllers/profile.ts';
import { authenticateToken } from '../middlewares/auth.ts';

const router = express.Router();

// User login
router.get('/profile', authenticateToken, getUserProfile);
router.patch('/profile', authenticateToken, updateUserProfile);
router.delete('/profile', authenticateToken, deleteUser);

export default router;
