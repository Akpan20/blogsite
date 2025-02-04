import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [users, posts, comments, pageViews] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.pageView.count(),
    ]);

    return NextResponse.json({
      totalUsers: users,
      totalPosts: posts,
      totalComments: comments,
      totalPageViews: pageViews,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error fetching dashboard stats' },
      { status: 500 }
    );
  }
}