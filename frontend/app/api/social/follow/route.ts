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
      const { followingId } = req.body;
      const followerId = session.user.id;

      if (followerId === followingId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      const follow = await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      return res.status(201).json(follow);
    } catch (error) {
      return res.status(500).json({ error: 'Error following user' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { followingId } = req.query;
      const followerId = session.user.id;

      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: parseInt(followingId as string),
          },
        },
      });

      return res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error unfollowing user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
