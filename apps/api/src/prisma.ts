import { PrismaClient } from "@prisma/client";

/*
 * One client per process, reused across invocations.
 *
 * On serverless a warm instance handles many requests, and constructing a
 * client per invocation would open a new connection each time. Stashing it on
 * globalThis also survives module reloads in development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
