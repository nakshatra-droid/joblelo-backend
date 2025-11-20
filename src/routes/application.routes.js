import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isRecruiter, isSeeker } from "../middlewares/role.middleware.js";
import {
  getMyApplications,
  getApplicantsForJob,
  getSingleApplication,
  updateApplicationStatus
} from "../controllers/application.controller.js";

const router = express.Router();

router.get("/my", verifyJWT, isSeeker, getMyApplications);
router.get("/job/:jobId", verifyJWT, isRecruiter, getApplicantsForJob);
router.get("/:appId", verifyJWT, isRecruiter, getSingleApplication);
router.put("/:appId/status", verifyJWT, isRecruiter, updateApplicationStatus);

export default router;
