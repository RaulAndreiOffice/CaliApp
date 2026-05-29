import { Request, Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE = "refreshToken";
const isProd = env.NODE_ENV === "production";

// In production the client and API are typically served from different
// sub-domains (cross-site), so the cookie must be SameSite=None; Secure to be
// sent at all. In development everything runs on localhost (same-site), where
// "lax" works and avoids requiring HTTPS.
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  path: "/api/auth",
};

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions, maxAge: MAX_AGE_MS });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
};

export const readRefreshCookie = (req: Request): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === REFRESH_COOKIE) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
};
