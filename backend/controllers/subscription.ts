import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import logger from '../utils/logger.ts';

// Define proper user type instead of 'any'
interface UserPayload {
  id: string;
  // Add other user properties as needed
}

interface AuthRequest extends Request {
  user?: UserPayload;
}

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { creatorId, months = 1 } = req.body;
    const subscriberId = req.user?.id;

    if (!subscriberId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (creatorId === subscriberId) {
      return res.status(400).json({ error: 'Cannot subscribe to yourself' });
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        creatorId,
        subscriberId,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingSubscription) {
      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          expiresAt: new Date(existingSubscription.expiresAt.getTime() + months * 30 * 24 * 60 * 60 * 1000)
        },
        include: { creator: { select: { id: true, username: true, name: true } } }
      });
      return res.json(updatedSubscription);
    }

    const subscription = await prisma.subscription.create({
      data: {
        creatorId,
        subscriberId,
        expiresAt: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
      },
      include: { creator: { select: { id: true, username: true, name: true } } }
    });

    return res.status(201).json(subscription);
  } catch (error) {
    logger.error('Subscription creation failed', { error });
    return res.status(500).json({ error: 'Error creating subscription' });
  }
};

export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: { subscriberId: userId, expiresAt: { gt: new Date() } },
        skip,
        take: Number(limit),
        include: { creator: { select: { id: true, username: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.subscription.count({ where: { subscriberId: userId, expiresAt: { gt: new Date() } } })
    ]);

    return res.json({
      subscriptions,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    logger.error('Failed to fetch subscriptions', { error });
    return res.status(500).json({ error: 'Error fetching subscriptions' });
  }
};

export const getSubscribers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [subscribers, total] = await Promise.all([
      prisma.subscription.findMany({
        where: { creatorId: userId, expiresAt: { gt: new Date() } },
        skip,
        take: Number(limit),
        include: { subscriber: { select: { id: true, username: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.subscription.count({ where: { creatorId: userId, expiresAt: { gt: new Date() } } })
    ]);

    return res.json({
      subscribers: subscribers.map(s => ({
        ...s.subscriber,
        expiresAt: s.expiresAt
      })),
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    logger.error('Failed to fetch subscribers', { error });
    return res.status(500).json({ error: 'Error fetching subscribers' });
  }
};