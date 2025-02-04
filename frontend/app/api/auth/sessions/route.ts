import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { revokeSession } from '@/src/lib/session';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeSessions = await redis.keys(`session:${session.user.id}:*`);
  const sessions = await Promise.all(
    activeSessions.map(async (key) => {
      const data = await redis.get(key);
      return {
        id: key.split(':')[2],
        ...JSON.parse(data as string),
      };
    })
  );

  return NextResponse.json({ sessions });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await req.json();
  await revokeSession(session.user.id, sessionId);

  return NextResponse.json({ success: true });
}