import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { db, wesalRateLimits } from "@workspace/db";
import { sql } from "drizzle-orm";
import { z } from "zod";

export class WesalError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");

// Salted, memory-hard password hashing. Bound concurrent jobs to avoid exhausting RAM.
let passwordJobs = 0;
function derive(password: string, salt: string): Promise<Buffer> {
  if (passwordJobs >= 4) throw new WesalError(503, "الخدمة مشغولة الآن. حاول بعد قليل.");
  passwordJobs++;
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      passwordJobs--;
      if (error) reject(error); else resolve(key);
    });
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt32768:${salt}:${(await derive(password, salt)).toString("hex")}`;
}
export async function checkPassword(password: string, saved?: string) {
  // An unknown account still incurs the same password computation.
  const [, salt, encoded] = saved?.split(":") ?? ["", "0".repeat(32), "0".repeat(128)];
  const key = await derive(password, salt);
  const expected = Buffer.from(encoded, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected) && !!saved;
}
export function normalizePhone(input: string) {
  let phone = input.trim().replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)).replace(/[\s()\-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^01[0125]\d{8}$/.test(phone)) phone = `+20${phone.slice(1)}`;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new WesalError(400, "أدخل رقم هاتف صحيحًا مع رمز الدولة، مثل +20.");
  return phone;
}
export const phoneSchema = z.string().max(40).transform(normalizePhone);
const nameSchema = z.string().trim().min(2, "أدخل الاسم بالكامل.").max(120, "الاسم طويل جدًا.");
export const registerSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: z.string().min(10, "استخدم كلمة مرور من 10 أحرف على الأقل.").max(128, "كلمة المرور طويلة جدًا."),
  email: z.string().trim().toLowerCase().max(254).refine((s) => !s || z.string().email().safeParse(s).success, "البريد الإلكتروني غير صحيح.").optional(),
}).strict();
export const loginSchema = z.object({
  phone: phoneSchema, password: z.string().min(1, "أدخل كلمة المرور.").max(128),
}).strict();
export const invitationSchema = z.object({
  recipientName: nameSchema,
  recipientPhone: phoneSchema,
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "استخدم تاريخًا بصيغة سنة-شهر-يوم.").refine((s) => {
    const parsed = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(+parsed) && parsed.toISOString().slice(0, 10) === s && +parsed <= Date.now()
      && parsed.getUTCFullYear() >= new Date().getUTCFullYear() - 120;
  }, "أدخل تاريخ ميلاد صحيحًا، غير مستقبلي، خلال آخر 120 سنة."),
  relationship: z.enum(["father", "mother", "spouse", "relative", "friend", "other"]),
}).strict();
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "رابط الدعوة غير صالح.");
export const acceptSchema = z.object({ token: tokenSchema, consent: z.literal(true) }).strict();
export const idSchema = z.string().uuid();
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new WesalError(400, parsed.error.issues[0]?.message ?? "راجع البيانات المدخلة.");
  return parsed.data;
}
export async function rateLimit(key: string, maximum: number, seconds = 600) {
  // Persisted atomic counters survive restarts and concurrent requests. No raw phone/IP stored.
  const result = await db.execute(sql`
    INSERT INTO wesal_rate_limits (key, count, expires_at)
    VALUES (${digest(key)}, 1, NOW() + ${seconds} * INTERVAL '1 second')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN wesal_rate_limits.expires_at <= NOW() THEN 1 ELSE wesal_rate_limits.count + 1 END,
      expires_at = CASE WHEN wesal_rate_limits.expires_at <= NOW() THEN NOW() + ${seconds} * INTERVAL '1 second' ELSE wesal_rate_limits.expires_at END
    RETURNING count
  `);
  if (Number(result.rows[0]?.count) > maximum) throw new WesalError(429, "محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.");
}
