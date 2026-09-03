import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashSecret(value: string, secret: string): string {
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

export function secretsEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "ubc-student";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : "UBC student";
}

export function emailDomain(email: string): string {
  return email.split("@")[1] ?? "";
}
