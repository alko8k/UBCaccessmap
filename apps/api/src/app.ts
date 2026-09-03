import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import type { PrismaClient } from "@prisma/client";
import type { Env } from "./env.ts";
import type { EmailAdapter } from "./email/adapter.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { sessionMiddleware } from "./middleware/session.ts";
import { authRouter } from "./routes/auth.ts";
import { healthRouter } from "./routes/health.ts";
import { mapRouter } from "./routes/map.ts";
import { reportRouter } from "./routes/reports.ts";
import { washroomRouter } from "./routes/washrooms.ts";

export type AppDeps = {
  prisma: PrismaClient;
  email: EmailAdapter;
  env: Env;
};

export function createApp(deps: AppDeps) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: deps.env.WEB_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "32kb" }));
  app.use(cookieParser());
  app.use(sessionMiddleware(deps.prisma, deps.env));

  app.use(healthRouter(deps.prisma));
  app.use(authRouter(deps));
  app.use(mapRouter(deps.prisma));
  app.use(washroomRouter(deps.prisma));
  app.use(reportRouter(deps.prisma));

  app.use(errorHandler);
  return app;
}
