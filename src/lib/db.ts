import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: import.meta.env.DEV ? ['query', 'error', 'warn'] : ['error'],
});

if (import.meta.env.DEV) globalForPrisma.prisma = prisma;

// Utility types
export type User = Awaited<ReturnType<typeof prisma.user.findUnique>>;
export type Post = Awaited<ReturnType<typeof prisma.post.findUnique>>;
export type UserPreferences = Awaited<ReturnType<typeof prisma.userPreferences.findUnique>>;

