import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";
import { refreshTokenRepository } from "./repositories/refreshToken.repository";

const PORT = parseInt(env.PORT, 10);

// Periodically purge expired refresh tokens so the table doesn't grow without
// bound. Runs once at startup and then every 12 hours; unref'd so it never
// keeps the process alive on its own.
const CLEANUP_INTERVAL_MS = 12 * 60 * 60 * 1000;

const cleanupExpiredTokens = async () => {
  try {
    await refreshTokenRepository.deleteExpired();
  } catch (err) {
    console.error("Failed to clean up expired refresh tokens:", err);
  }
};

app.listen(PORT, () => {
  console.log(`CaliAPP Backend running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  void cleanupExpiredTokens();
  setInterval(() => void cleanupExpiredTokens(), CLEANUP_INTERVAL_MS).unref();
});
