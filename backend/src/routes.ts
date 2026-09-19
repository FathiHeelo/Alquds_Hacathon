import { Router } from "express";

import { adminRouter } from "./modules/admin/admin.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { healthRouter } from "./modules/health/health.routes";
import { jobsRouter } from "./modules/jobs/jobs.routes";
import { notificationsRouter } from "./modules/notifications/notifications.routes";
import { offersTopRouter } from "./modules/offers/offers.routes";
import { categoriesRouter, repairRequestsRouter } from "./modules/repair-requests/repairRequest.routes";
import { reportsRouter } from "./modules/reports/reports.routes";
import { rewardsRouter } from "./modules/rewards/rewards.routes";
import { subscriptionsRouter } from "./modules/subscriptions/subscriptions.routes";
import { techniciansRouter } from "./modules/technicians/technicians.routes";
import { usersRouter } from "./modules/users/users.routes";

export const apiV1Router = Router();

apiV1Router.use("/health", healthRouter);
apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/technicians", techniciansRouter);
apiV1Router.use("/service-categories", categoriesRouter);
apiV1Router.use("/repair-requests", repairRequestsRouter);
apiV1Router.use("/offers", offersTopRouter);
apiV1Router.use("/jobs", jobsRouter);
apiV1Router.use("/notifications", notificationsRouter);
apiV1Router.use("/rewards", rewardsRouter);
apiV1Router.use("/subscriptions", subscriptionsRouter);
apiV1Router.use("/reports", reportsRouter);
apiV1Router.use("/admin", adminRouter);
