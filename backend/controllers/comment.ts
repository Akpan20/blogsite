import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import logger from '../utils/logger.ts';

interface UserPayload {
  id: string;
  username: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

interface CommentInput {
  postId: string;
  content: string;
}

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content } = req.body as CommentInput;
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, published: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found or not published' });
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true }
        }
      }
    });

    return res.status(201).json(comment);
  } catch (error) {
    logger.error('Comment creation failed:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Failed to create comment' 
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPostComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.comment.count({ where: { postId } })
    ]);

    return res.json({
      comments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Failed to fetch comments:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to fetch comments'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body as { content: string };
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true }
        }
      }
    });

    return res.json(updatedComment);
  } catch (error) {
    logger.error('Comment update failed:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to update comment'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.comment.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    logger.error('Comment deletion failed:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to delete comment'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};