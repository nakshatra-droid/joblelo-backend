import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isRecruiter, isSeeker } from "../middlewares/role.middleware.js";
import {
  createJob,
  getMyJobs,
  deleteJob,
  getAllJobs,
  getSingleJob,
  applyJob
} from "../controllers/job.controller.js";

const router = express.Router();
router.post("/create", verifyJWT, isRecruiter, createJob);
router.get("/my-jobs", verifyJWT, isRecruiter, getMyJobs);
router.delete("/:id", verifyJWT, isRecruiter, deleteJob);
router.get("/all", getAllJobs);
router.get("/:id", getSingleJob);
router.post("/:id/apply", verifyJWT, isSeeker, applyJob);

export default router;
