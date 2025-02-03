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
      const { content, postId, parentId } = req.body;
      
      const comment = await prisma.comment.create({
        data: {
          content,
          postId,
          userId: session.user.id,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: true,
          replies: {
            include: {
              user: true,
              likes: true,
            },
          },
        },
      });
      
      return res.status(201).json(comment);
    } catch (error) {
      return res.status(500).json({ error: 'Error creating comment' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { postId } = req.query;
      
      const comments = await prisma.comment.findMany({
        where: {
          postId: parseInt(postId as string),
          parentId: null, // Get only top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: true,
          replies: {
            include: {
              user: true,
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching comments' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}