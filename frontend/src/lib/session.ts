import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function revokeSession(userId: string, sessionId: string) {
  // Add session to blacklist
  await redis.set(`blacklist:${sessionId}`, 'revoked', {
    ex: 30 * 24 * 60 * 60, // 30 days
  });
  
  // Remove all sessions for user
  const userSessions = await redis.keys(`session:${userId}:*`);
  if (userSessions.length > 0) {
    await redis.del(userSessions);
  }
}

export async function isSessionValid(sessionId: string): Promise<boolean> {
  const isBlacklisted = await redis.get(`blacklist:${sessionId}`);
  return !isBlacklisted;
}
