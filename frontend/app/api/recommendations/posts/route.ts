import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    return NextResponse.json({
      followedPosts,
      recommendedPosts,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching recommendations' }, { status: 500 });
  }
}