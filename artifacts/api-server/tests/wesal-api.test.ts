import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { once } from "node:events";
import { db, pool, wesalUsers, wesalSessions, wesalInvitations } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import app from "../src/app";
import { digest } from "../src/lib/wesal-security";

if (process.env.NODE_ENV !== "test") throw new Error("Only run against the development test database.");
let server: Server;
let base: string;
const ids: string[] = [];
const seed = Date.now().toString().slice(-7);
const phones = [1, 2, 3].map((n) => `+2010${seed}${n}`);
// Synthetic fixtures only. Never print credentials, invitation links, or sessions.
const password = "Test-only-password-49!";
async function request(path: string, method = "GET", data?: unknown, token?: string) {
  const response = await fetch(`${base}/api/wesal${path}`, {
    method, headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }, body: data ? JSON.stringify(data) : undefined,
  });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}
before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server has no port.");
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (ids.length) await db.delete(wesalUsers).where(inArray(wesalUsers.id, ids));
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();
});
test("persistent phone accounts, isolated invitations, explicit consent, expiry, revocation, and logout", async () => {
  assert.equal((await request("/auth/me")).status, 401);
  const invalid = await request("/auth/register", "POST", { name: "Test", phone: phones[0], password: "short" });
  assert.equal(invalid.status, 400);
  async function register(name: string, phone: string) {
    const response = await request("/auth/register", "POST", { name, phone, password });
    assert.equal(response.status, 201);
    ids.push(response.body.user.id);
    assert.equal(response.body.user.phoneVerified, false);
    assert.equal(response.body.user.email, null);
    assert.equal("passwordHash" in response.body.user, false);
    assert.equal(typeof response.body.token, "string");
    return response.body;
  }
  const owner = await register("Wesal API Test Caregiver", phones[0]);
  const stranger = await register("Wesal API Test Unrelated", phones[2]);
  const recipient = await register("Wesal API Test Recipient", phones[1]);
  const [stored] = await db.select().from(wesalUsers).where(eq(wesalUsers.id, owner.user.id));
  assert.ok(stored.passwordHash.startsWith("scrypt32768:"));
  assert.notEqual(stored.passwordHash, password);
  const [session] = await db.select().from(wesalSessions).where(eq(wesalSessions.userId, owner.user.id));
  assert.equal(session.tokenHash, digest(owner.token));
  assert.notEqual(session.tokenHash, owner.token);
  assert.equal((await request("/auth/register", "POST", { name: "Duplicate", phone: phones[0], password })).status, 409);
  assert.equal((await request("/auth/login", "POST", { phone: phones[0], password: "incorrect-password" })).status, 401);
  assert.equal((await request("/auth/login", "POST", { phone: phones[0], password })).status, 200);
  assert.equal((await request("/auth/me", "GET", undefined, owner.token)).body.user, undefined);
  const invitation = {
    recipientName: "Wesal API Test Recipient", recipientPhone: phones[1],
    birthDate: "1950-01-01", relationship: "father",
  };
  assert.equal((await request("/invitations", "POST", invitation)).status, 401);
  assert.equal((await request("/invitations", "POST", { ...invitation, birthDate: "2099-02-01" }, owner.token)).status, 400);
  assert.equal((await request("/invitations", "POST", { ...invitation, birthDate: "1950-02-31" }, owner.token)).status, 400);
  assert.equal((await request("/invitations", "POST", { ...invitation, recipientPhone: phones[0] }, owner.token)).status, 400);
  const created = await request("/invitations", "POST", invitation, owner.token);
  assert.equal(created.status, 201);
  assert.equal(created.body.invitation.status, "pending");
  const token = created.body.token as string;
  const id = created.body.invitation.id as string;
  const [storedInvite] = await db.select().from(wesalInvitations).where(eq(wesalInvitations.id, id));
  assert.equal(storedInvite.tokenHash, digest(token));
  assert.notEqual(storedInvite.tokenHash, token);
  const preview = await request(`/invitations/preview/${token}`);
  assert.equal(preview.status, 200);
  assert.deepEqual(Object.keys(preview.body).sort(), ["caregiverName", "expiresAt", "relationship", "status"]);
  assert.equal((await request("/invitations/accept", "POST", { token, consent: true }, owner.token)).status, 403);
  assert.equal((await request("/invitations/accept", "POST", { token, consent: true }, stranger.token)).status, 403);
  assert.equal((await request("/invitations/accept", "POST", { token, consent: false }, recipient.token)).status, 400);
  const accepted = await Promise.all([1, 2].map(() => request("/invitations/accept", "POST", { token, consent: true }, recipient.token)));
  assert.deepEqual(accepted.map((r) => r.status).sort(), [200, 409], "Atomic acceptance permits a single consumer.");
  const [consent] = await db.select().from(wesalInvitations).where(eq(wesalInvitations.id, id));
  assert.equal(consent.recipientUserId, recipient.user.id);
  assert.ok(consent.consentAt);
  assert.equal(consent.consentVersion, "care-connection-v1-no-clinical-access");
  assert.equal((await request("/invitations", "GET", undefined, owner.token)).body.sent[0].status, "accepted");
  assert.equal((await request("/invitations", "GET", undefined, recipient.token)).body.received[0].id, id);
  assert.deepEqual((await request("/invitations", "GET", undefined, stranger.token)).body, { sent: [], received: [] });
  assert.equal((await request(`/invitations/${id}/revoke`, "POST", undefined, stranger.token)).status, 404);
  assert.equal((await request(`/invitations/${id}/withdraw`, "POST", undefined, recipient.token)).status, 204);
  assert.equal((await request("/invitations", "GET", undefined, owner.token)).body.sent[0].status, "revoked");
  const expiring = await request("/invitations", "POST", invitation, owner.token);
  await db.update(wesalInvitations).set({ expiresAt: new Date(Date.now() - 1000) })
    .where(eq(wesalInvitations.id, expiring.body.invitation.id));
  assert.equal((await request(`/invitations/preview/${expiring.body.token}`)).body.status, "expired");
  assert.equal((await request("/invitations/accept", "POST", { token: expiring.body.token, consent: true }, recipient.token)).status, 409);
  const revoked = await request("/invitations", "POST", invitation, owner.token);
  assert.equal((await request(`/invitations/${revoked.body.invitation.id}/revoke`, "POST", undefined, owner.token)).status, 204);
  assert.equal((await request("/invitations/accept", "POST", { token: revoked.body.token, consent: true }, recipient.token)).status, 409);
  assert.equal((await request("/auth/logout", "POST", undefined, owner.token)).status, 204);
  assert.equal((await request("/auth/me", "GET", undefined, owner.token)).status, 401);
  const active = await db.select().from(wesalSessions).where(and(eq(wesalSessions.userId, owner.user.id), eq(wesalSessions.tokenHash, digest(owner.token))));
  assert.equal(active.length, 0);
});
