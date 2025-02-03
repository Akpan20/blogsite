import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    if (req.method === 'GET') {
      try {
        const userId = session.user.id;
  
        // Get user's interests and interactions
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            interactions: {
              include: {
                post: {
                  include: {
                    tags: true,
                  },
                },
              },
            },
          },
        });
  
        // Get followed users' posts
        const followedPosts = await prisma.post.findMany({
          where: {
            author: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
            published: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        });
  
        // Get posts based on user's interests
        const recommendedPosts = await prisma.post.findMany({
          where: {
            AND: [
              {
                published: true,
              },
              {
                tags: {
                  some: {
                    name: {
                      in: user?.recommendedTags,
                    },
                  },
                },
              },
            ],
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        });
  
        return res.status(200).json({
          followedPosts,
          recommendedPosts,
        });
      } catch (error) {
        return res.status(500).json({ error: 'Error fetching recommendations' });
      }
    }
  
    return res.status(405).json({ error: 'Method not allowed' });
}
