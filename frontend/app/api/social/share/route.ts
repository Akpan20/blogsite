import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId, platform } = body;
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

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error sharing post' }, { status: 500 });
  }
}