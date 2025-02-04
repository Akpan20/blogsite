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

    const [engagement, totalUsers] = await Promise.all([
      prisma.userEngagement.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      prisma.user.count(),
    ]);

    const totalEngagement = engagement.reduce(
      (acc, curr) => acc + curr._count.id,
      0
    );

    return NextResponse.json({
      engagement,
      engagementRate: totalUsers > 0 ? (totalEngagement / totalUsers) * 100 : 0,
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return NextResponse.json(
      { error: 'Error fetching engagement metrics' },
      { status: 500 }
    );
  }
}