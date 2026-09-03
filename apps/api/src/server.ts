import "dotenv/config";
import { createApp } from "./app.ts";
import { createMemoryEmailAdapter } from "./email/memory.ts";
import { loadEnv } from "./env.ts";
import { prisma } from "./prisma.ts";

const env = loadEnv();
const app = createApp({
  prisma,
  email: createMemoryEmailAdapter(),
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
