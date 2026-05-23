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
