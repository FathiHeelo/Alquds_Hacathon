import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../src/app";

const api = () => request(app);
const PASSWORD = "Demo1234!";
const run = Date.now().toString(36);

const login = async (email: string) => (await api().post("/api/v1/auth/login").send({ email, password: PASSWORD })).body.token as string;
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

let customer: string;
let technician: string; // demo-technician (verified, pro, plumbing)
let technician2: string; // demo-technician-2 (pending verification, free)
let admin: string;

beforeAll(async () => {
  [customer, technician, technician2, admin] = await Promise.all([
    login("customer@ammerha.demo"),
    login("technician@ammerha.demo"),
    login("technician2@ammerha.demo"),
    login("admin@ammerha.demo")
  ]);
});

describe("S01 auth, roles, technician profile", () => {
  it("registers, logs in and reads /me", async () => {
    const email = `new-${run}@test.dev`;
    const reg = await api().post("/api/v1/auth/register").send({ name: "New Customer", email, password: "Passw0rd!x", role: "customer" });
    expect(reg.status).toBe(201);
    expect(reg.body.user.passwordHash).toBeUndefined();

    const log = await api().post("/api/v1/auth/login").send({ email, password: "Passw0rd!x" });
    expect(log.status).toBe(200);
    const me = await api().get("/api/v1/auth/me").set(auth(log.body.token));
    expect(me.body.email).toBe(email);
  });

  it("rejects duplicate email, bad password, admin self-registration", async () => {
    const dup = await api().post("/api/v1/auth/register").send({ name: "Dup", email: "customer@ammerha.demo", password: "Passw0rd!x", role: "customer" });
    expect(dup.status).toBe(409);
    const bad = await api().post("/api/v1/auth/login").send({ email: "customer@ammerha.demo", password: "wrong-password" });
    expect(bad.status).toBe(401);
    const adm = await api().post("/api/v1/auth/register").send({ name: "Evil", email: `evil-${run}@test.dev`, password: "Passw0rd!x", role: "admin" });
    expect(adm.status).toBe(400);
  });

  it("enforces roles", async () => {
    expect((await api().get("/api/v1/auth/me")).status).toBe(401);
    expect((await api().get("/api/v1/technicians/me").set(auth(customer))).status).toBe(403);
    expect((await api().get("/api/v1/admin/summary").set(auth(technician))).status).toBe(403);
  });

  it("reads and updates the technician profile", async () => {
    const res = await api()
      .patch("/api/v1/technicians/me")
      .set(auth(technician))
      .send({ yearsExperience: 9, serviceAreas: ["old_city", "sheikh_jarrah"], availability: "busy" });
    expect(res.status).toBe(200);
    expect(res.body.yearsExperience).toBe(9);
    expect(res.body.availability).toBe("busy");
    await api().patch("/api/v1/technicians/me").set(auth(technician)).send({ availability: "available" });
    const me = await api().get("/api/v1/technicians/me").set(auth(technician));
    expect(me.body.reputation.completedJobs).toBeGreaterThanOrEqual(1);
  });
});

let requestId: string;
let offerId: string;
let jobId: string;

describe("S02 repair requests", () => {
  it("creates a request and lists categories", async () => {
    expect((await api().get("/api/v1/service-categories").set(auth(customer))).body.length).toBeGreaterThan(3);
    const res = await api()
      .post("/api/v1/repair-requests")
      .set(auth(customer))
      .send({ categoryId: "plumbing", description: "Kitchen pipe burst", area: "old_city", urgency: "high", media: [{ url: "https://x.dev/a.jpg", type: "image" }] });
    expect(res.status).toBe(201);
    expect(res.body.media).toHaveLength(1);
    requestId = res.body.id;
  });

  it("shows it in the technician feed, filtered by specialty/area", async () => {
    const feed = await api().get("/api/v1/repair-requests/feed").set(auth(technician));
    expect(feed.body.map((r: { id: string }) => r.id)).toContain(requestId);
    // Electrical technician (specialty electrical) must not see plumbing requests.
    const feed2 = await api().get("/api/v1/repair-requests/feed").set(auth(technician2));
    expect(feed2.body.map((r: { id: string }) => r.id)).not.toContain(requestId);
  });

  it("guards update/cancel", async () => {
    const other = await api().post("/api/v1/auth/register").send({ name: "Other", email: `other-${run}@test.dev`, password: "Passw0rd!x", role: "customer" });
    expect((await api().patch(`/api/v1/repair-requests/${requestId}`).set(auth(other.body.token)).send({ description: "hijack!!" })).status).toBe(403);

    const tmp = await api().post("/api/v1/repair-requests").set(auth(customer)).send({ categoryId: "painting", description: "Paint living room" });
    expect((await api().patch(`/api/v1/repair-requests/${tmp.body.id}`).set(auth(customer)).send({ description: "Paint two rooms" })).body.description).toBe("Paint two rooms");
    expect((await api().post(`/api/v1/repair-requests/${tmp.body.id}/cancel`).set(auth(customer))).body.status).toBe("cancelled");
    expect((await api().patch(`/api/v1/repair-requests/${tmp.body.id}`).set(auth(customer)).send({ description: "Too late edit" })).status).toBe(409);
  });

  it("deletes a request from the database, but only while it's not tied to a job", async () => {
    const deletable = await api().post("/api/v1/repair-requests").set(auth(customer)).send({ categoryId: "painting", description: "Paint the balcony" });
    expect((await api().delete(`/api/v1/repair-requests/${deletable.body.id}`).set(auth(customer))).status).toBe(204);
    expect((await api().get(`/api/v1/repair-requests/${deletable.body.id}`).set(auth(customer))).status).toBe(404);

    const other = await api().post("/api/v1/auth/register").send({ name: "Other2", email: `other2-${run}@test.dev`, password: "Passw0rd!x", role: "customer" });
    const notMine = await api().post("/api/v1/repair-requests").set(auth(customer)).send({ categoryId: "painting", description: "Paint the kitchen" });
    expect((await api().delete(`/api/v1/repair-requests/${notMine.body.id}`).set(auth(other.body.token))).status).toBe(403);

    const withOffer = await api().post("/api/v1/repair-requests").set(auth(customer)).send({ categoryId: "plumbing", description: "Fix the tap" });
    const off = await api().post(`/api/v1/repair-requests/${withOffer.body.id}/offers`).set(auth(technician)).send({ price: 50 });
    const accepted = await api().post(`/api/v1/offers/${off.body.id}/accept`).set(auth(customer));
    expect(accepted.status).toBe(201);
    expect((await api().delete(`/api/v1/repair-requests/${withOffer.body.id}`).set(auth(customer))).status).toBe(409);
  });
});

describe("AI urgent dispatch", () => {
  it("expands from verified location data and creates exactly one job for the first successful acceptance", async () => {
    const urgent = await api().post("/api/v1/repair-requests").set(auth(customer)).send({
      categoryId: "plumbing",
      description: "A pressurized water supply connection is leaking heavily",
      locationSummary: "Old City, Jerusalem",
      lat: 31.7804,
      lng: 35.2332,
      urgency: "high",
      aiSummary: { diagnosis: { routing: { type: "URGENT_TECHNICIAN" } } }
    });
    expect(urgent.status).toBe(201);
    const started = await api().post(`/api/v1/repair-requests/${urgent.body.id}/urgent-dispatch`).set(auth(customer));
    expect(started.status).toBe(201);
    expect(started.body.radiusKm).toBe(3);
    expect(started.body.eligibleCount).toBeGreaterThanOrEqual(1);
    expect((await api().post(`/api/v1/repair-requests/${urgent.body.id}/urgent-dispatch/accept`).set(auth(technician2)).send({ price: 180, etaMinutes: 15 })).status).toBe(403);

    const [first, second] = await Promise.all([
      api().post(`/api/v1/repair-requests/${urgent.body.id}/urgent-dispatch/accept`).set(auth(technician)).send({ price: 180, etaMinutes: 15 }),
      api().post(`/api/v1/repair-requests/${urgent.body.id}/urgent-dispatch/accept`).set(auth(technician)).send({ price: 180, etaMinutes: 15 })
    ]);
    expect([first.status, second.status].sort()).toEqual([201, 409]);
    const winner = first.status === 201 ? first : second;
    expect(winner.body.requestId).toBe(urgent.body.id);
    const state = await api().get(`/api/v1/repair-requests/${urgent.body.id}/urgent-dispatch`).set(auth(customer));
    expect(state.body.status).toBe("assigned");
  });
});

describe("S03 offers & job lifecycle", () => {
  it("creates and lists offers", async () => {
    const offer = await api().post(`/api/v1/repair-requests/${requestId}/offers`).set(auth(technician)).send({ price: 120, message: "I can come today", etaMinutes: 45 });
    expect(offer.status).toBe(201);
    offerId = offer.body.id;
    expect((await api().post(`/api/v1/repair-requests/${requestId}/offers`).set(auth(technician)).send({ price: 100 })).status).toBe(409);

    const list = await api().get(`/api/v1/repair-requests/${requestId}/offers`).set(auth(customer));
    expect(list.body).toHaveLength(1);
    expect(list.body[0].price).toBe(120);
  });

  it("accepts one offer transactionally and rejects a double accept", async () => {
    const other = await api().post(`/api/v1/repair-requests/${requestId}/offers`).set(auth(technician2)).send({ price: 90 });
    // technician2 cannot see/answer plumbing feed but may still offer directly; this is the competing offer.
    expect(other.status).toBe(201);

    const [a, b] = await Promise.all([
      api().post(`/api/v1/offers/${offerId}/accept`).set(auth(customer)),
      api().post(`/api/v1/offers/${other.body.id}/accept`).set(auth(customer))
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);
    const winner = a.status === 201 ? a : b;
    expect(winner.body.status).toBe("accepted");
    jobId = winner.body.id;
    offerId = a.status === 201 ? offerId : other.body.id;

    const again = await api().post(`/api/v1/offers/${offerId}/accept`).set(auth(customer));
    expect(again.status).toBe(409);
    expect(again.body.code).toBe("OFFER_ALREADY_ACCEPTED");
  });

  it("enforces job transitions", async () => {
    const winnerToken = (await api().get(`/api/v1/jobs/${jobId}`).set(auth(customer))).body.technicianId === "demo-technician" ? technician : technician2;
    const set = (status: string, extra = {}, token = winnerToken) => api().post(`/api/v1/jobs/${jobId}/status`).set(auth(token)).send({ status, ...extra });

    expect((await set("completed")).body.code).toBe("INVALID_JOB_TRANSITION"); // accepted -> completed not allowed
    expect((await set("on_the_way")).status).toBe(200);
    expect((await set("scheduled")).body.code).toBe("INVALID_JOB_TRANSITION"); // on_the_way -> scheduled not allowed
    expect((await api().post(`/api/v1/jobs/${jobId}/status`).set(auth(customer)).send({ status: "in_progress" })).status).toBe(403); // customer cannot drive
    expect((await set("in_progress")).status).toBe(200);
    (globalThis as { __winner?: string }).__winner = winnerToken;
  });
});

describe("S04 chat & notifications", () => {
  it("authorizes and stores messages", async () => {
    const outsider = await api().post("/api/v1/auth/register").send({ name: "Out", email: `out-${run}@test.dev`, password: "Passw0rd!x", role: "customer" });
    expect((await api().get(`/api/v1/jobs/${jobId}/conversation`).set(auth(outsider.body.token))).status).toBe(403);

    const text = await api().post(`/api/v1/jobs/${jobId}/conversation/messages`).set(auth(customer)).send({ type: "text", body: "Are you close?" });
    expect(text.status).toBe(201);
    const loc = await api().post(`/api/v1/jobs/${jobId}/conversation/messages`).set(auth(customer)).send({ type: "location", payload: { lat: 31.78, lng: 35.23 } });
    expect(loc.status).toBe(201);
    expect((await api().post(`/api/v1/jobs/${jobId}/conversation/messages`).set(auth(customer)).send({ type: "text", body: "" })).status).toBe(400);

    const list = await api().get(`/api/v1/jobs/${jobId}/conversation`).set(auth((globalThis as { __winner?: string }).__winner!));
    expect(list.body.messages).toHaveLength(2);
  });

  it("creates notifications and tracks read state", async () => {
    const before = await api().get("/api/v1/notifications").set(auth(customer));
    expect(before.body.unreadCount).toBeGreaterThan(0);
    const types = before.body.items.map((n: { type: string }) => n.type);
    expect(types).toEqual(expect.arrayContaining(["new_offer", "on_the_way", "started"]));

    const first = before.body.items[0].id;
    expect((await api().post(`/api/v1/notifications/${first}/read`).set(auth(customer))).status).toBe(200);
    const after = await api().get("/api/v1/notifications").set(auth(customer));
    expect(after.body.unreadCount).toBe(before.body.unreadCount - 1);
    await api().post("/api/v1/notifications/read-all").set(auth(customer));
    expect((await api().get("/api/v1/notifications?unread=true").set(auth(customer))).body.items).toHaveLength(0);
    // Another user cannot read my notification.
    expect((await api().post(`/api/v1/notifications/${first}/read`).set(auth(technician))).status).toBe(404);
  });
});

describe("S05-S07 completion, reviews, rewards, finance", () => {
  const review = { overall: 5, quality: 5, speed: 4, commitment: 5, communication: 5, comment: "Great" };

  it("rejects review before completion", async () => {
    expect((await api().post(`/api/v1/jobs/${jobId}/review`).set(auth(customer)).send(review)).body.code).toBe("REVIEW_NOT_ELIGIBLE");
  });

  it("completes the job with a financial summary", async () => {
    const winner = (globalThis as { __winner?: string }).__winner!;
    const done = await api().post(`/api/v1/jobs/${jobId}/status`).set(auth(winner)).send({ status: "completed", laborAmount: 100, partsAmount: 50 });
    expect(done.status).toBe(200);
    expect(done.body.financial).toMatchObject({ labor: 100, parts: 50, subtotal: 150, commissionRate: 0.1, platformFee: 15, total: 165, technicianEarning: 150 });
    expect(done.body.request.status).toBe("completed");
  });

  it("accepts one review per job and updates the aggregate", async () => {
    const before = (await api().get("/api/v1/rewards/balance").set(auth(customer))).body.balance;
    expect((await api().post(`/api/v1/jobs/${jobId}/review`).set(auth(customer)).send(review)).status).toBe(201);
    expect((await api().post(`/api/v1/jobs/${jobId}/review`).set(auth(customer)).send(review)).status).toBe(409);
    expect((await api().post(`/api/v1/jobs/${jobId}/review`).set(auth(customer)).send({ ...review, overall: 9 })).status).toBe(400);

    const techId = (await api().get(`/api/v1/jobs/${jobId}`).set(auth(customer))).body.technicianId;
    const profile = await api().get(`/api/v1/technicians/${techId}`).set(auth(customer));
    expect(profile.body.reputation.ratingCount).toBeGreaterThanOrEqual(1);
    expect(profile.body.reputation.ratingAvg).toBeGreaterThan(0);

    // Rating awards points once.
    expect((await api().get("/api/v1/rewards/balance").set(auth(customer))).body.balance).toBe(before + 50);
  });

  it("redeems rewards and protects the balance", async () => {
    const bal = (await api().get("/api/v1/rewards/balance").set(auth(customer))).body;
    expect(bal.balance).toBe(bal.earned - bal.redeemed);

    const tooExpensive = await api().post("/api/v1/rewards/redeem").set(auth(customer)).send({ partnerRewardId: "demo-reward-big" });
    expect(tooExpensive.status).toBe(409);
    expect(tooExpensive.body.code).toBe("INSUFFICIENT_POINTS");

    const ok = await api().post("/api/v1/rewards/redeem").set(auth(customer)).send({ partnerRewardId: "demo-reward-cafe" });
    expect(ok.status).toBe(201);
    expect(ok.body.balance).toBe(bal.balance - 20);
    const after = (await api().get("/api/v1/rewards/balance").set(auth(customer))).body;
    expect(after.balance).toBe(bal.balance - 20);
    expect((await api().get("/api/v1/rewards/partners").set(auth(customer))).body.length).toBeGreaterThan(1);
  });

  it("applies free vs Pro entitlement", async () => {
    const pro = await api().get("/api/v1/subscriptions/me").set(auth(technician));
    expect(pro.body).toMatchObject({ plan: "pro", isPro: true });
    expect((await api().get("/api/v1/subscriptions/capabilities/offer-assistant").set(auth(technician))).status).toBe(200);

    const free = await api().get("/api/v1/subscriptions/me").set(auth(technician2));
    expect(free.body).toMatchObject({ plan: "free", isPro: false });
    const gated = await api().get("/api/v1/subscriptions/capabilities/offer-assistant").set(auth(technician2));
    expect(gated.status).toBe(403);
    expect(gated.body.code).toBe("PRO_REQUIRED");
  });

  it("reports technician earnings", async () => {
    const winner = (globalThis as { __winner?: string }).__winner!;
    const res = await api().get("/api/v1/reports/earnings/me").set(auth(winner));
    expect(res.status).toBe(200);
    expect(res.body.completedJobs).toBeGreaterThanOrEqual(1);
    expect(res.body.netEarnings).toBeGreaterThanOrEqual(150);
  });
});

describe("S08 admin, verification, risk", () => {
  it("is admin-protected", async () => {
    expect((await api().get("/api/v1/admin/technicians/verification").set(auth(customer))).status).toBe(403);
    expect((await api().get("/api/v1/admin/technicians/verification")).status).toBe(401);
  });

  it("approves and rejects technician verification", async () => {
    const queue = await api().get("/api/v1/admin/technicians/verification").set(auth(admin));
    expect(queue.body.map((p: { userId: string }) => p.userId)).toContain("demo-technician-2");

    const rejected = await api().post("/api/v1/admin/technicians/demo-technician-2/verification").set(auth(admin)).send({ decision: "reject", note: "Missing documents" });
    expect(rejected.body).toMatchObject({ verificationStatus: "rejected", isVerified: false });
    const approved = await api().post("/api/v1/admin/technicians/demo-technician-2/verification").set(auth(admin)).send({ decision: "approve" });
    expect(approved.body).toMatchObject({ verificationStatus: "approved", isVerified: true });
  });

  it("persists and reviews risk assessments without auto-banning", async () => {
    const created = await api()
      .post("/api/v1/admin/risk-assessments")
      .set(auth(admin))
      .send({ userId: "demo-technician-2", level: "high", score: 0.9, source: "jabr-sim", flags: [{ code: "suspicious_pricing" }] });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("open");

    // High AI score alone must not change the account.
    const me = await api().get("/api/v1/auth/me").set(auth(technician2));
    expect(me.body.status).toBe("active");

    const reviewed = await api().post(`/api/v1/admin/risk-assessments/${created.body.id}/review`).set(auth(admin)).send({ note: "Checked, fine" });
    expect(reviewed.body.status).toBe("reviewed");
    expect(reviewed.body.reviewedBy).toBe("demo-admin");
  });

  it("applies explicit human suspend/unfreeze actions", async () => {
    const victim = await api().post("/api/v1/auth/register").send({ name: "Victim", email: `victim-${run}@test.dev`, password: "Passw0rd!x", role: "customer" });
    const id = victim.body.user.id;
    expect((await api().post(`/api/v1/admin/users/${id}/actions`).set(auth(admin)).send({ action: "suspend", note: "abuse" })).body.status).toBe("suspended");
    expect((await api().get("/api/v1/auth/me").set(auth(victim.body.token))).status).toBe(403);
    expect((await api().post("/api/v1/auth/login").send({ email: `victim-${run}@test.dev`, password: "Passw0rd!x" })).status).toBe(403);
    expect((await api().post(`/api/v1/admin/users/${id}/actions`).set(auth(admin)).send({ action: "unfreeze" })).body.status).toBe("active");
    expect((await api().post("/api/v1/admin/users/demo-admin/actions").set(auth(admin)).send({ action: "suspend" })).status).toBe(403);
  });

  it("serves the summary and manages Pro demo activation", async () => {
    const s = await api().get("/api/v1/admin/summary").set(auth(admin));
    expect(s.status).toBe(200);
    expect(s.body.users).toBeGreaterThan(3);
    expect(s.body.proSubscribers).toBeGreaterThanOrEqual(1);
    expect(s.body.commissions.platformFees).toBeGreaterThan(0);
    expect(s.body.openReports).toBeGreaterThanOrEqual(1);

    const act = await api().post("/api/v1/admin/subscriptions/demo-technician-2").set(auth(admin)).send({ plan: "pro", days: 30 });
    expect(act.body.isPro).toBe(true);
    expect((await api().get("/api/v1/subscriptions/capabilities/offer-assistant").set(auth(technician2))).status).toBe(200);
    await api().post("/api/v1/admin/subscriptions/demo-technician-2").set(auth(admin)).send({ plan: "free" });
  });
});
