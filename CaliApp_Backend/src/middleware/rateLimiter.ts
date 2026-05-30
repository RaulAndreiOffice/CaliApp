import rateLimit from "express-rate-limit";

const tooManyRequestsBody = {
  success: false,
  error: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later",
  },
};

// Strict limit for credentials-based endpoints (login/register/forgot-password).
// Tight because each request triggers expensive bcrypt verification and is the
// main brute-force surface.
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: tooManyRequestsBody,
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limit for /refresh: the client may refresh once per tab on focus and
// shared IPs (NAT, office) can have multiple legitimate users. Refresh tokens
// are UUIDv4, so brute force is infeasible — this is defense-in-depth.
export const refreshRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: tooManyRequestsBody,
  standardHeaders: true,
  legacyHeaders: false,
});

// Global ceiling for the whole API. A normal SPA screen fires only a handful of
// requests (React Query caches and dedupes), so 300/min/IP never trips for real
// use — but it caps abusive floods so a single misbehaving client can't pin the
// database with the heavier stats/dashboard queries and degrade everyone else.
// Kept generous on purpose: users behind shared NAT/CGNAT must not throttle each
// other. (Relies on `trust proxy` being set so the real client IP is used.)
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: tooManyRequestsBody,
  standardHeaders: true,
  legacyHeaders: false,
});
