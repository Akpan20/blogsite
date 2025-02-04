import { prisma } from '@/src/lib/prisma';

export async function generateUniqueUsername(baseName: string): Promise<string> {
  // Remove special characters and spaces, convert to lowercase
  let username = baseName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20); // Limit length

  if (username.length < 3) {
    username = `user${Math.random().toString(36).slice(2, 8)}`;
  }

  let finalUsername = username;
  let counter = 1;

  // Keep trying until we find a unique username
  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { username: finalUsername },
    });

    if (!existingUser) {
      break;
    }

    finalUsername = `${username}${counter}`;
    counter++;
  }

  return finalUsername;
}

export function validateUsername(username: string): boolean {
  // Username requirements:
  // - 3-20 characters long
  // - Only letters, numbers, and underscores
  // - Must start with a letter
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}