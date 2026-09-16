import "dotenv/config";
import { createApp } from "./app.ts";
import { createMemoryEmailAdapter } from "./email/memory.ts";
import { createSmtpEmailAdapter } from "./email/smtp.ts";
import { loadEnv } from "./env.ts";
import { prisma } from "./prisma.ts";

const env = loadEnv();

/*
 * Fall back to the in-memory adapter when SMTP is not configured, so the app
 * still runs offline and in tests. That adapter logs the link instead of
 * sending it, which is only acceptable outside production.
 */
function createEmailAdapter() {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "SMTP_USER and SMTP_PASS are required in production: refusing to start with an email adapter that cannot send.",
      );
    }
    console.warn("[email] SMTP is not configured. Sign-in links will be logged, not sent.");
    return createMemoryEmailAdapter();
  }

  console.info(`[email] Sending sign-in links via ${env.SMTP_HOST} as ${env.SMTP_USER}.`);
  return createSmtpEmailAdapter({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM ?? `UBC Access Map <${env.SMTP_USER}>`,
  });
}

const app = createApp({
  prisma,
  email: createEmailAdapter(),
  env,
});

const server = app.listen(env.PORT, () => {
  console.log(`API listening at ${env.API_ORIGIN}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
