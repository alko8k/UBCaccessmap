import { ALLOWED_EMAIL_DOMAINS } from "@ubc-access-map/shared";

export function isAllowedUbcEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain !== undefined && ALLOWED_EMAIL_DOMAINS.includes(domain as (typeof ALLOWED_EMAIL_DOMAINS)[number]);
}
