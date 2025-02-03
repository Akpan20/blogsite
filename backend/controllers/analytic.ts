import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import logger from '../utils/logger.ts';

interface PageViewResult {
  createdAt: Date;
  _count: { id: number };
}

interface EngagementMetric {
  type: string;
  _count: { id: number };
}

export const getPageViews = async (req: Request, res: Response) => {
  try {
    const pageViews: PageViewResult[] = await prisma.pageView.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 30
    });

    res.json(pageViews);
  } catch (error) {
    logger.error('Failed to fetch page views:', error);
    res.status(500).json({ error: 'Failed to fetch page views' });
  }
};

export const getEngagementMetrics = async (req: Request, res: Response) => {
  try {
    const [engagement, totalUsers] = await Promise.all([
      prisma.userEngagement.groupBy({
        by: ['type'],
        _count: { id: true }
      }) as Promise<EngagementMetric[]>,
      prisma.user.count()
    ]);

    const totalEngagement = engagement.reduce((acc, curr) => acc + curr._count.id, 0);
    
    res.json({
      engagement,
      engagementRate: totalUsers > 0 ? (totalEngagement / totalUsers) * 100 : 0
    });
  } catch (error) {
    logger.error('Failed to fetch engagement metrics:', error);
    res.status(500).json({ error: 'Failed to fetch engagement metrics' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [users, posts, comments, pageViews] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.pageView.count()
    ]);

    res.json({
      totalUsers: users,
      totalPosts: posts,
      totalComments: comments,
      totalPageViews: pageViews
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};