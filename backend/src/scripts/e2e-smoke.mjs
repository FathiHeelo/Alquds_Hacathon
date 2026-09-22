const BASE = "http://localhost:3000/api/v1";
const results = [];
const ok = (name, cond, extra) => { results.push({ name, pass: !!cond, extra }); };

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty body, e.g. 204 */ }
  return { status: res.status, body: json };
}

async function login(email, password = "Demo1234!") {
  const r = await call("POST", "/auth/login", { email, password });
  return r.body?.token;
}

async function main() {
  const customer = await login("customer@ammerha.demo");
  const technician = await login("technician@ammerha.demo");
  const technician2 = await login("technician2@ammerha.demo");
  const admin = await login("admin@ammerha.demo");
  ok("login all demo accounts", customer && technician && technician2 && admin);

  const me = await call("GET", "/auth/me", null, customer);
  ok("auth/me returns customer profile", me.status === 200 && me.body.role === "customer", me.body);

  const cats = await call("GET", "/service-categories", null, customer);
  ok("service categories list", cats.status === 200 && cats.body.length > 3, cats.body?.length);

  // Repair request lifecycle
  const created = await call("POST", "/repair-requests", { categoryId: "plumbing", description: "E2E smoke test leak under sink", area: "البلدة القديمة", urgency: "high" }, customer);
  ok("create repair request", created.status === 201 && created.body.status === "open", created);
  const reqId = created.body?.id;

  const feed = await call("GET", "/repair-requests/feed", null, technician);
  ok("technician feed includes new request", feed.status === 200 && feed.body.some(r => r.id === reqId));

  const offer = await call("POST", `/repair-requests/${reqId}/offers`, { price: 100, etaMinutes: 30 }, technician);
  ok("create offer", offer.status === 201 && offer.body.technician?.technicianProfile, offer.body);

  const dupOffer = await call("POST", `/repair-requests/${reqId}/offers`, { price: 90 }, technician);
  ok("duplicate offer rejected", dupOffer.status === 409);

  const listOffers = await call("GET", `/repair-requests/${reqId}/offers`, null, customer);
  ok("list offers for request", listOffers.status === 200 && listOffers.body.length === 1);

  const accept = await call("POST", `/offers/${offer.body.id}/accept`, null, customer);
  ok("accept offer creates job", accept.status === 201 && accept.body.status === "accepted" && accept.body.offer?.technician?.technicianProfile, accept.body);
  const jobId = accept.body?.id;

  const doubleAccept = await call("POST", `/offers/${offer.body.id}/accept`, null, customer);
  ok("double accept rejected", doubleAccept.status === 409 && doubleAccept.body.code === "OFFER_ALREADY_ACCEPTED");

  const badTransition = await call("POST", `/jobs/${jobId}/status`, { status: "completed" }, technician);
  ok("invalid job transition rejected", badTransition.status === 409);

  const onTheWay = await call("POST", `/jobs/${jobId}/status`, { status: "on_the_way" }, technician);
  ok("job transition on_the_way", onTheWay.status === 200 && onTheWay.body.status === "on_the_way");

  const inProgress = await call("POST", `/jobs/${jobId}/status`, { status: "in_progress" }, technician);
  ok("job transition in_progress", inProgress.status === 200);

  // Chat
  const msg = await call("POST", `/jobs/${jobId}/conversation/messages`, { type: "text", body: "Hello from e2e" }, customer);
  ok("send chat message", msg.status === 201);
  const chatOutsider = await login("technician2@ammerha.demo");
  const outsiderRead = await call("GET", `/jobs/${jobId}/conversation`, null, chatOutsider);
  ok("outsider blocked from conversation", outsiderRead.status === 403);
  const chatList = await call("GET", `/jobs/${jobId}/conversation`, null, customer);
  ok("chat lists message", chatList.status === 200 && chatList.body.messages.length >= 1);

  // Notifications
  const notifs = await call("GET", "/notifications", null, customer);
  ok("customer has notifications", notifs.status === 200 && notifs.body.unreadCount > 0, notifs.body.unreadCount);

  // Complete job -> financial + points + earnings
  const complete = await call("POST", `/jobs/${jobId}/status`, { status: "completed", laborAmount: 100, partsAmount: 0 }, technician);
  ok("job completes with financial", complete.status === 200 && complete.body.financial?.total === 110 && complete.body.request.status === "completed", complete.body.financial);

  const balanceBefore = await call("GET", "/rewards/balance", null, customer);
  const review = await call("POST", `/jobs/${jobId}/review`, { overall: 5, quality: 5, speed: 5, commitment: 5, communication: 5, comment: "great" }, customer);
  ok("submit review", review.status === 201, review.body);
  const dupReview = await call("POST", `/jobs/${jobId}/review`, { overall: 5, quality: 5, speed: 5, commitment: 5, communication: 5 }, customer);
  ok("duplicate review rejected", dupReview.status === 409);
  const balanceAfter = await call("GET", "/rewards/balance", null, customer);
  ok("review awards points", balanceAfter.body.balance === balanceBefore.body.balance + 50, [balanceBefore.body, balanceAfter.body]);

  const techProfile = await call("GET", "/technicians/demo-technician", null, customer);
  ok("technician rating aggregate updated", techProfile.status === 200 && techProfile.body.reputation.ratingCount > 0, techProfile.body.reputation);

  // Rewards
  const partners = await call("GET", "/rewards/partners", null, customer);
  ok("partner rewards listed", partners.status === 200 && partners.body.length > 1);
  const tooExpensive = await call("POST", "/rewards/redeem", { partnerRewardId: "demo-reward-big" }, customer);
  ok("insufficient points blocked", tooExpensive.status === 409 && tooExpensive.body.code === "INSUFFICIENT_POINTS");
  const redeemOk = await call("POST", "/rewards/redeem", { partnerRewardId: "demo-reward-cafe" }, customer);
  ok("redeem succeeds and deducts", redeemOk.status === 201 && redeemOk.body.balance === balanceAfter.body.balance - 20, redeemOk.body);

  // Subscriptions
  const proSub = await call("GET", "/subscriptions/me", null, technician);
  ok("technician is pro", proSub.status === 200 && proSub.body.isPro === true);
  const freeSub = await call("GET", "/subscriptions/me", null, technician2);
  ok("technician2 is free", freeSub.status === 200 && freeSub.body.isPro === false);
  const gated = await call("GET", "/subscriptions/capabilities/offer-assistant", null, technician2);
  ok("free technician gated from AI assistant", gated.status === 403 && gated.body.code === "PRO_REQUIRED");

  // Reports/earnings
  const earnings = await call("GET", "/reports/earnings/me", null, technician);
  ok("technician earnings reflect completed job", earnings.status === 200 && earnings.body.completedJobs >= 1 && earnings.body.netEarnings > 0, earnings.body);

  // Admin
  const summary = await call("GET", "/admin/summary", null, admin);
  ok("admin summary", summary.status === 200 && summary.body.users > 3 && summary.body.commissions.platformFees > 0, summary.body);
  const asCustomer = await call("GET", "/admin/summary", null, customer);
  ok("non-admin blocked from admin", asCustomer.status === 403);
  const verifQueue = await call("GET", "/admin/technicians/verification", null, admin);
  ok("verification queue has pending techs", verifQueue.status === 200 && verifQueue.body.length >= 1, verifQueue.body.length);
  const risk = await call("POST", "/admin/risk-assessments", { level: "high", score: 0.9, flags: [{ code: "smoke_test" }] }, admin);
  ok("create risk assessment", risk.status === 201 && risk.body.status === "open");
  const reviewedRisk = await call("POST", `/admin/risk-assessments/${risk.body.id}/review`, { note: "checked" }, admin);
  ok("review risk assessment", reviewedRisk.status === 200 && reviewedRisk.body.status === "reviewed");

  // Urgent dispatch
  const urgentReq = await call("POST", "/repair-requests", { categoryId: "plumbing", description: "Burst pipe emergency e2e", lat: 31.7804, lng: 35.2332, urgency: "high", aiSummary: { diagnosis: { routing: { type: "URGENT_TECHNICIAN" } } } }, customer);
  ok("create urgent request", urgentReq.status === 201);
  const dispatchStart = await call("POST", `/repair-requests/${urgentReq.body.id}/urgent-dispatch`, null, customer);
  ok("start urgent dispatch", dispatchStart.status === 201 && dispatchStart.body.eligibleCount >= 1, dispatchStart.body);
  const dispatchAccept = await call("POST", `/repair-requests/${urgentReq.body.id}/urgent-dispatch/accept`, { price: 200, etaMinutes: 10 }, technician);
  ok("urgent dispatch accept creates job", dispatchAccept.status === 201, dispatchAccept.body);

  // Delete request
  const deletable = await call("POST", "/repair-requests", { categoryId: "painting", description: "to be deleted e2e" }, customer);
  const del = await call("DELETE", `/repair-requests/${deletable.body.id}`, null, customer);
  ok("delete request returns 204", del.status === 204);
  const getDeleted = await call("GET", `/repair-requests/${deletable.body.id}`, null, customer);
  ok("deleted request is gone", getDeleted.status === 404);

  const notMine = await call("POST", "/repair-requests", { categoryId: "painting", description: "not yours" }, customer);
  const deleteOthers = await call("DELETE", `/repair-requests/${notMine.body.id}`, null, technician2);
  ok("cannot delete someone else's request", deleteOthers.status === 403);

  const deleteAcceptedJob = await call("DELETE", `/repair-requests/${reqId}`, null, customer);
  ok("cannot delete a request tied to a job", deleteAcceptedJob.status === 409, deleteAcceptedJob.body);

  // Account status
  const victim = await fetch(BASE + "/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Victim", email: `victim-${Date.now()}@e2e.dev`, password: "Passw0rd!x", role: "customer" }) }).then(r => r.json());
  const suspend = await call("POST", `/admin/users/${victim.user.id}/actions`, { action: "suspend", note: "e2e" }, admin);
  ok("admin can suspend a user", suspend.status === 200 && suspend.body.status === "suspended");
  const suspendedLogin = await call("POST", "/auth/login", { email: victim.user.email, password: "Passw0rd!x" });
  ok("suspended account blocked at login", suspendedLogin.status === 403);

  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  for (const r of results) console.log(`${r.pass ? "✅" : "❌"} ${r.name}`);
  if (failed.length) {
    console.log("\n--- FAILURES DETAIL ---");
    for (const r of failed) console.log(r.name, JSON.stringify(r.extra));
    process.exit(1);
  }
}

main().catch((e) => { console.error("SMOKE TEST CRASHED", e); process.exit(1); });
