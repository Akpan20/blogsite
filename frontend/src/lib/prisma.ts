import { PrismaClient } from '@prisma/client'

// Create a global type to prevent multiple Prisma client instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create or reuse the Prisma client
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// In development, store the client on the global object to prevent hot reloading from creating multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma