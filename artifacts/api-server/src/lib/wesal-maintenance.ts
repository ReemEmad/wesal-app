import { db, wesalRateLimits, wesalSessions } from "@workspace/db";
import { lt } from "drizzle-orm";
import { logger } from "./logger";

export function startWesalMaintenance() {
  const timer = setInterval(() => {
    void Promise.all([
      db.delete(wesalSessions).where(lt(wesalSessions.expiresAt, new Date())),
      db.delete(wesalRateLimits).where(lt(wesalRateLimits.expiresAt, new Date())),
    ]).catch(() => logger.warn("Expired authentication data cleanup failed; it will be retried."));
  }, 15 * 60_000);
  timer.unref();
}
