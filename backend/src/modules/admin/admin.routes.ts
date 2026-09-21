import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { subscriptionService } from "../subscriptions/subscriptions.service";
import { adminService, type RiskInput } from "./admin.service";

export const adminRouter = Router();
adminRouter.use(guard("admin"));

const caseStatus = z.enum(["open", "reviewed", "dismissed"]);

adminRouter.get("/summary", async (_request, response) => {
  response.json(await adminService.summary());
});

// Technician verification
const verificationQuery = z.object({ status: z.enum(["pending", "approved", "rejected"]).default("pending") });
adminRouter.get("/technicians/verification", validate("query", verificationQuery), async (request, response) => {
  response.json(await adminService.verificationQueue(validated<z.infer<typeof verificationQuery>>(request, "query").status));
});

const decisionSchema = z.object({ decision: z.enum(["approve", "reject"]), note: z.string().trim().max(500).optional() });
adminRouter.post("/technicians/:userId/verification", validate("body", decisionSchema), async (request, response) => {
  const { decision, note } = validated<z.infer<typeof decisionSchema>>(request, "body");
  response.json(await adminService.decideVerification(request.auth!.id, String(request.params.userId), decision, note));
});

// Safety reports
const statusQuery = z.object({ status: caseStatus.optional() });
adminRouter.get("/reports", validate("query", statusQuery), async (request, response) => {
  response.json(await adminService.reports(validated<z.infer<typeof statusQuery>>(request, "query").status));
});
adminRouter.patch("/reports/:id", validate("body", z.object({ status: caseStatus })), async (request, response) => {
  response.json(await adminService.setReportStatus(String(request.params.id), validated<{ status: z.infer<typeof caseStatus> }>(request, "body").status));
});

// Risk assessments
const riskSchema = z.object({
  userId: z.string().optional(),
  requestId: z.string().optional(),
  level: z.enum(["low", "medium", "high"]),
  score: z.number().min(0).max(1).optional(),
  source: z.string().max(50).optional(),
  flags: z.array(z.object({ code: z.string().min(1).max(60), note: z.string().max(255).optional() })).max(20).optional()
});
adminRouter.post("/risk-assessments", validate("body", riskSchema), async (request, response) => {
  response.status(201).json(await adminService.createRisk(validated<RiskInput>(request, "body")));
});
adminRouter.get("/risk-assessments", validate("query", statusQuery), async (request, response) => {
  response.json(await adminService.risks(validated<z.infer<typeof statusQuery>>(request, "query").status));
});
const reviewSchema = z.object({ status: z.enum(["reviewed", "dismissed"]).default("reviewed"), note: z.string().trim().max(1000).optional() });
adminRouter.post("/risk-assessments/:id/review", validate("body", reviewSchema), async (request, response) => {
  const { status, note } = validated<z.infer<typeof reviewSchema>>(request, "body");
  response.json(await adminService.reviewRisk(request.auth!.id, String(request.params.id), status, note));
});

// Explicit human account actions (never triggered by AI scores)
const actionSchema = z.object({ action: z.enum(["review", "warn", "suspend", "freeze", "unfreeze"]), note: z.string().trim().max(500).optional() });
adminRouter.post("/users/:id/actions", validate("body", actionSchema), async (request, response) => {
  const { action, note } = validated<z.infer<typeof actionSchema>>(request, "body");
  response.json(await adminService.actOnUser(request.auth!.id, String(request.params.id), action, note));
});

// Pro entitlement demo activation
const planSchema = z.object({ plan: z.enum(["free", "pro"]), days: z.number().int().positive().max(365).optional() });
adminRouter.post("/subscriptions/:technicianId", validate("body", planSchema), async (request, response) => {
  const { plan, days } = validated<z.infer<typeof planSchema>>(request, "body");
  response.json(await subscriptionService.setPlan(String(request.params.technicianId), plan, days));
});
