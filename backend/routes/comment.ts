import express from 'express';
import { authenticateToken } from '../middlewares/auth.ts';
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment
} from '../controllers/comment.ts';

const router = express.Router();

// Public routes
router.get('/post/:postId', getPostComments);

// Protected routes
router.post('/', authenticateToken, createComment);
router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;