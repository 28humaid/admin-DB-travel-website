import { PrismaClient } from '@prisma/client';

// Reuse PrismaClient across hot reloads in development
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Optional: enable logs for better visibility during dev
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Prevent creating multiple instances during development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
