import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const headersList = headers();
    const body = await req.json();
    
    const { url, postId, sessionId, duration, referrer } = body;
    
    const pageView = await prisma.pageView.create({
      data: {
        url,
        postId: postId || null,
        userId: session?.user?.id || null,
        sessionId,
        ipAddress: req.ip || '',
        userAgent: headersList.get('user-agent') || '',
        referer: referrer || headersList.get('referer') || null,
        duration,
      },
    });

    return NextResponse.json(pageView, { status: 201 });
  } catch (error) {
    console.error('Error recording page view:', error);
    return NextResponse.json(
      { error: 'Error recording page view' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pageViews = await prisma.pageView.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    return NextResponse.json(pageViews);
  } catch (error) {
    console.error('Error fetching page views:', error);
    return NextResponse.json(
      { error: 'Error fetching page views' },
      { status: 500 }
    );
  }
}