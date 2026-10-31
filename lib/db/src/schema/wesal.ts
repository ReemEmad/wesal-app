import { pgTable, uuid, text, boolean, timestamp, date, integer, index } from "drizzle-orm/pg-core";

export const wesalUsers = pgTable("wesal_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wesalSessions = pgTable("wesal_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id").notNull().references(() => wesalUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("wesal_sessions_user_idx").on(t.userId)]);

export const wesalInvitations = pgTable("wesal_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => wesalUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  birthDate: date("birth_date").notNull(),
  relationship: text("relationship").notNull(),
  status: text("status").notNull().default("pending"),
  recipientUserId: uuid("recipient_user_id").references(() => wesalUsers.id, { onDelete: "set null" }),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentVersion: text("consent_version"),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("wesal_invitations_owner_idx").on(t.ownerId),
  index("wesal_invitations_recipient_idx").on(t.recipientUserId),
]);

export const wesalRateLimits = pgTable("wesal_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
