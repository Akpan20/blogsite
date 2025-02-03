import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import logger from '../utils/logger.ts';

interface UserPayload {
  id: string;
  username: string;
  email: string;
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

// Generic pagination helper with proper typing
const paginate = async <
  T extends Prisma.FollowDelegate,
  Where extends Prisma.FollowWhereInput,
  Include extends Prisma.FollowInclude
>(
  model: T,
  where: Where,
  include: Include,
  page: number,
  limit: number
): Promise<{
  data: Array<Prisma.FollowGetPayload<{ include: Include }>>;
  total: number;
  pages: number;
  currentPage: number;
}> => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.findMany({ skip, take: limit, where, include }),
    model.count({ where })
  ]);

  return {
    data,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const { followingId } = req.body;
    const followerId = req.user?.id;

    if (!followerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const [userToFollow, existingFollow] = await Promise.all([
      prisma.user.findUnique({ where: { id: followingId } }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } }
      })
    ]);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (existingFollow) {
      return res.status(409).json({ error: 'Already following this user' });
    }

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
      include: { following: { select: { id: true, username: true } } }
    });

    return res.status(201).json({
      message: 'Successfully followed user',
      user: follow.following
    });
  } catch (error) {
    logger.error('Follow error:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Operation failed'
        : (error instanceof Error ? error.message : 'Unknown error')
    });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const { followingId } = req.params;
    const followerId = req.user?.id;

    if (!followerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (!follow) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } }
    });

    return res.status(204).send();
  } catch (error) {
    logger.error('Unfollow error:', error);
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Operation failed' 
        : (error instanceof Error ? error.message : 'Unknown error')
    });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const result = await paginate(
      prisma.follow,
      { followingId: userId },
      {
        follower: {
          select: { id: true, username: true, name: true, avatar: true }
        }
      },
      page,
      limit
    );

    return res.json({
      ...result,
      followers: result.data.map(f => f.follower)
    });
  } catch (error) {
    logger.error('Get followers error:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to fetch followers'
        : (error instanceof Error ? error.message : 'Unknown error')
    });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const result = await paginate(
      prisma.follow,
      { followerId: userId },
      {
        following: {
          select: { id: true, username: true, name: true, avatar: true }
        }
      },
      page,
      limit
    );

    return res.json({
      ...result,
      following: result.data.map(f => f.following)
    });
  } catch (error) {
    logger.error('Get following error:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to fetch following'
        : (error instanceof Error ? error.message : 'Unknown error')
    });
  }
};
