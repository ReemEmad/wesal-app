import { Router, type RequestHandler, type Response } from "express";
import { db, wesalUsers, wesalSessions } from "@workspace/db";
import { and, eq, gt } from "drizzle-orm";
import { checkPassword, digest, hashPassword, loginSchema, newToken, parse, rateLimit, registerSchema, WesalError } from "../lib/wesal-security";

type Account = typeof wesalUsers.$inferSelect;
export const authUser = (res: Response) => res.locals.wesalUser as Account;
export const publicUser = (u: Account) => ({
  id: u.id, name: u.name, phone: u.phone, email: u.email, phoneVerified: u.phoneVerified,
});
export const requireWesalAuth: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
  if (!token) throw new WesalError(401, "سجّل الدخول للمتابعة.");
  const tokenHash = digest(token);
  const [record] = await db.select({ user: wesalUsers }).from(wesalSessions)
    .innerJoin(wesalUsers, eq(wesalUsers.id, wesalSessions.userId))
    .where(and(eq(wesalSessions.tokenHash, tokenHash), gt(wesalSessions.expiresAt, new Date()))).limit(1);
  if (!record) throw new WesalError(401, "انتهت الجلسة. سجّل الدخول من جديد.");
  res.locals.wesalUser = record.user;
  res.locals.wesalTokenHash = tokenHash;
  next();
};
const router = Router();
router.use("/wesal", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
router.post("/wesal/auth/register", async (req, res) => {
  await rateLimit(`register-ip:${req.ip}`, 20);
  const data = parse(registerSchema, req.body);
  await rateLimit(`register-phone:${data.phone}`, 5);
  const passwordHash = await hashPassword(data.password);
  const token = newToken();
  try {
    const user = await db.transaction(async (tx) => {
      const [created] = await tx.insert(wesalUsers).values({
        name: data.name, phone: data.phone, email: data.email || null, passwordHash, phoneVerified: false,
      }).returning();
      await tx.insert(wesalSessions).values({
        tokenHash: digest(token), userId: created.id, expiresAt: new Date(Date.now() + 30 * 86400_000),
      });
      return created;
    });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    const e = error as { code?: string; cause?: { code?: string } };
    if (e.code === "23505" || e.cause?.code === "23505") {
      throw new WesalError(409, "تعذر إنشاء الحساب بهذه البيانات. إذا كان لديك حساب فسجّل الدخول.");
    }
    throw error;
  }
});
router.post("/wesal/auth/login", async (req, res) => {
  await rateLimit(`login-ip:${req.ip}`, 40);
  const data = parse(loginSchema, req.body);
  await rateLimit(`login-phone:${data.phone}`, 10);
  const [user] = await db.select().from(wesalUsers).where(eq(wesalUsers.phone, data.phone)).limit(1);
  if (!(await checkPassword(data.password, user?.passwordHash)) || !user) {
    throw new WesalError(401, "رقم الهاتف أو كلمة المرور غير صحيحة.");
  }
  const token = newToken();
  await db.insert(wesalSessions).values({
    tokenHash: digest(token), userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400_000),
  });
  res.json({ token, user: publicUser(user) });
});
router.get("/wesal/auth/me", requireWesalAuth, (_req, res) => res.json(publicUser(authUser(res))));
router.post("/wesal/auth/logout", requireWesalAuth, async (_req, res) => {
  await db.delete(wesalSessions).where(eq(wesalSessions.tokenHash, res.locals.wesalTokenHash as string));
  res.sendStatus(204);
});
export default router;
