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
  
    if (req.method === 'POST') {
      try {
        const { postId, platform } = req.body;
        const userId = session.user.id;
  
        const share = await prisma.share.create({
          data: {
            postId,
            userId,
            platform,
          },
        });
  
        // Record interaction for recommendation engine
        await prisma.userInteraction.create({
          data: {
            userId,
            postId,
            type: 'share',
          },
        });
  
        return res.status(201).json(share);
      } catch (error) {
        return res.status(500).json({ error: 'Error sharing post' });
      }
    }
  
    return res.status(405).json({ error: 'Method not allowed' });
  }

  