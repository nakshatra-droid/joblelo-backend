import { Router } from "express";
import userRoutes from "./user.routes.js";
import jobRoutes from "./job.routes.js";
import applicationRoutes from "./application.routes.js";
import companyRoutes from "./company.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/companies", companyRoutes);

export default router;
