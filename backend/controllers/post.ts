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

interface PostInput {
  title: string;
  content: string;
  published?: boolean;
  premium?: boolean;
  categories?: string[];
  tags?: string[];
}

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, published = false, premium = false, categories = [], tags = [] } = req.body as PostInput;
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        premium,
        authorId,
        categories: {
          connectOrCreate: categories.map(name => ({
            where: { name },
            create: { name }
          }))
        },
        tags: {
          connectOrCreate: tags.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      },
      include: {
        author: { select: { id: true, username: true, name: true } },
        categories: true,
        tags: true
      }
    });

    return res.status(201).json(post);
  } catch (error) {
    logger.error('Post creation failed:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to create post'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const { category, tag } = req.query;

    const where = {
      published: true,
      ...(category && {
        categories: { some: { name: category.toString() } }
      }),
      ...(tag && {
        tags: { some: { name: tag.toString() } }
      })
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, username: true, name: true } },
          categories: true,
          tags: true,
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
    ]);

    return res.json({
      posts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Failed to fetch posts:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to fetch posts'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, name: true } },
        categories: true,
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, username: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json(post);
  } catch (error) {
    logger.error('Failed to fetch post:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to fetch post'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, published, premium, categories = [], tags = [] } = req.body as PostInput;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        published,
        premium,
        categories: {
          set: [],
          connectOrCreate: categories.map(name => ({
            where: { name },
            create: { name }
          }))
        },
        tags: {
          set: [],
          connectOrCreate: tags.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      },
      include: {
        author: { select: { id: true, username: true, name: true } },
        categories: true,
        tags: true
      }
    });

    return res.json(updatedPost);
  } catch (error) {
    logger.error('Post update failed:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to update post'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.post.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    logger.error('Post deletion failed:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to delete post'
        : error instanceof Error ? error.message : 'Unknown error'
    });
  }
};