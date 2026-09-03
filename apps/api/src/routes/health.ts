import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export function healthRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "ubc-access-map-api",
    });
  });

  router.get("/api/health/ready", async (_request, response, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.status(200).json({
        status: "ok",
        service: "ubc-access-map-api",
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
