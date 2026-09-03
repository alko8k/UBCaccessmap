import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      cookies?: Record<string, string>;
      user?: {
        id: string;
        displayName: string;
        role: Role;
        emailDomain: string;
      };
    }
  }
}

export {};
