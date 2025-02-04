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
    const { followingId } = body;
    const followerId = session.user.id;

    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error following user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const followingId = searchParams.get('followingId');
    const followerId = session.user.id;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(followingId || '0'),
        },
      },
    });

    return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error unfollowing user' }, { status: 500 });
  }
}