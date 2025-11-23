import { Router } from "express";
import userRoutes from "./user.routes.js";
import jobRoutes from "./job.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);

export default router;
