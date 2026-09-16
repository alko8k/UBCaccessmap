import { createApp } from "../apps/api/src/app.ts";
import { createEmailAdapter } from "../apps/api/src/email/factory.ts";
import { loadEnv } from "../apps/api/src/env.ts";
import { prisma } from "../apps/api/src/prisma.ts";

/*
 * Serverless entry point.
 *
 * Vercel routes every /api/* request here and invokes the exported Express app
 * as the handler. Unlike src/server.ts there is no listen() call and no
 * dotenv import: the platform injects environment variables directly, and the
 * runtime owns the socket.
 *
 * Module scope runs once per warm instance, so the env parse, email adapter,
 * and Prisma client are built once and reused across invocations.
 */
const env = loadEnv();

export default createApp({
  prisma,
  email: createEmailAdapter(env),
  env,
});
