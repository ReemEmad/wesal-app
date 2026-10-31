import { Router } from "express";
import { db, wesalInvitations, wesalUsers } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { acceptSchema, digest, idSchema, invitationSchema, newToken, parse, rateLimit, tokenSchema, WesalError } from "../lib/wesal-security";
import { authUser, requireWesalAuth } from "./wesal-auth";

type Invitation = typeof wesalInvitations.$inferSelect;
function statusOf(invite: Invitation) {
  return invite.status === "pending" && invite.expiresAt <= new Date() ? "expired" : invite.status;
}
function serialize(invite: Invitation, caregiverName: string) {
  return {
    id: invite.id, recipientName: invite.recipientName, recipientPhone: invite.recipientPhone,
    birthDate: invite.birthDate, relationship: invite.relationship, status: statusOf(invite),
    expiresAt: invite.expiresAt.toISOString(), createdAt: invite.createdAt.toISOString(), caregiverName,
  };
}
const router = Router();
router.get("/wesal/invitations/preview/:token", async (req, res) => {
  await rateLimit(`preview-ip:${req.ip}`, 120, 60);
  const token = parse(tokenSchema, req.params.token);
  const [row] = await db.select({ invitation: wesalInvitations, caregiverName: wesalUsers.name })
    .from(wesalInvitations).innerJoin(wesalUsers, eq(wesalUsers.id, wesalInvitations.ownerId))
    .where(eq(wesalInvitations.tokenHash, digest(token))).limit(1);
  if (!row) throw new WesalError(404, "رابط الدعوة غير صالح أو لم يعد متاحًا.");
  // Do not disclose recipient identity, phone, or date of birth to anonymous link holders.
  res.json({
    caregiverName: row.caregiverName, relationship: row.invitation.relationship,
    expiresAt: row.invitation.expiresAt.toISOString(), status: statusOf(row.invitation),
  });
});
router.get("/wesal/invitations", requireWesalAuth, async (_req, res) => {
  const user = authUser(res);
  const select = () => db.select({ invitation: wesalInvitations, caregiverName: wesalUsers.name })
    .from(wesalInvitations).innerJoin(wesalUsers, eq(wesalUsers.id, wesalInvitations.ownerId));
  const [sent, received] = await Promise.all([
    select().where(eq(wesalInvitations.ownerId, user.id)).orderBy(desc(wesalInvitations.createdAt)).limit(100),
    select().where(eq(wesalInvitations.recipientUserId, user.id)).orderBy(desc(wesalInvitations.createdAt)).limit(100),
  ]);
  res.json({
    sent: sent.map((r) => serialize(r.invitation, r.caregiverName)),
    received: received.map((r) => serialize(r.invitation, r.caregiverName)),
  });
});
router.post("/wesal/invitations", requireWesalAuth, async (req, res) => {
  const user = authUser(res);
  await rateLimit(`invite-user:${user.id}`, 20, 3600);
  const data = parse(invitationSchema, req.body);
  if (user.phone === data.recipientPhone) throw new WesalError(400, "لا يمكنك إرسال دعوة إلى رقم حسابك نفسه.");
  const token = newToken();
  const [created] = await db.insert(wesalInvitations).values({
    ownerId: user.id, ...data, tokenHash: digest(token), expiresAt: new Date(Date.now() + 7 * 86400_000),
  }).returning();
  // This endpoint creates a link. It deliberately makes no claim of SMS/WhatsApp delivery.
  res.status(201).json({ invitation: serialize(created, user.name), token });
});
router.post("/wesal/invitations/accept", requireWesalAuth, async (req, res) => {
  const user = authUser(res);
  await rateLimit(`accept-user:${user.id}`, 30, 600);
  const data = parse(acceptSchema, req.body);
  const accepted = await db.transaction(async (tx) => {
    const [invite] = await tx.select().from(wesalInvitations)
      .where(eq(wesalInvitations.tokenHash, digest(data.token))).limit(1).for("update");
    if (!invite) throw new WesalError(404, "رابط الدعوة غير صالح.");
    if (statusOf(invite) !== "pending") throw new WesalError(409, "هذه الدعوة مستخدمة أو منتهية أو ملغاة.");
    if (invite.ownerId === user.id) throw new WesalError(403, "لا يمكنك قبول دعوتك الخاصة. سجّل الدخول بحساب الشخص المدعو.");
    if (invite.recipientPhone !== user.phone) throw new WesalError(403, "هذه الدعوة مخصصة لرقم هاتف آخر. سجّل الدخول بالحساب المقصود.");
    const [updated] = await tx.update(wesalInvitations).set({
      status: "accepted", recipientUserId: user.id, consentAt: new Date(),
      // Consent records the care connection only; unverified numbers are not verified identity
      // and this application has no clinical-data access capability.
      consentVersion: "care-connection-v1-no-clinical-access",
    }).where(eq(wesalInvitations.id, invite.id)).returning();
    const [owner] = await tx.select({ name: wesalUsers.name }).from(wesalUsers).where(eq(wesalUsers.id, invite.ownerId));
    return serialize(updated, owner.name);
  });
  res.json(accepted);
});
router.post("/wesal/invitations/:id/revoke", requireWesalAuth, async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const [updated] = await db.update(wesalInvitations).set({ status: "revoked", revokedAt: new Date() })
    .where(and(eq(wesalInvitations.id, id), eq(wesalInvitations.ownerId, authUser(res).id))).returning({ id: wesalInvitations.id });
  if (!updated) throw new WesalError(404, "الدعوة غير موجودة.");
  res.sendStatus(204);
});
router.post("/wesal/invitations/:id/withdraw", requireWesalAuth, async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const [updated] = await db.update(wesalInvitations).set({ status: "revoked", revokedAt: new Date() })
    .where(and(eq(wesalInvitations.id, id), eq(wesalInvitations.recipientUserId, authUser(res).id))).returning({ id: wesalInvitations.id });
  if (!updated) throw new WesalError(404, "لا توجد موافقة مسجلة لهذا الحساب.");
  res.sendStatus(204);
});
export default router;
