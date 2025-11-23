import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { apiError } from "../utils/apiError.js";
import db from "../models/index.js";

const { Application, Job, User, Company } = db;
export const getMyApplications = asyncHandler(async (req, res) => {
  const apps = await Application.findAll({
    where: { job_seeker_id: req.user.id },
    include: [
      {
        model: Job,
        include: [{ model: Company }]
      }
    ],
    order: [["created_at", "DESC"]],
  });

  return res.status(200)
    .json(new ApiResponse(200, apps, "Applications fetched"));
});

export const getApplicantsForJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const job = await Job.findOne({
    where: { id: jobId, created_by: req.user.id }
  });

  if (!job) throw new apiError(403, "Not allowed. This is not your job");
  const applicants = await Application.findAll({
    where: { job_id: jobId },
    include: [
      {
        model: User,
        attributes: {
          exclude: ["password"]
        }
      }
    ],
    order: [["created_at", "DESC"]],
  });

  return res.status(200)
    .json(new ApiResponse(200, applicants, "Applicants fetched"));
});

export const getSingleApplication = asyncHandler(async (req, res) => {
  const appId = req.params.appId;
  const application = await Application.findByPk(appId, {
    include: [
      {
        model: Job,
        include: [{ model: Company }]
      },
      {
        model: User,
        attributes: { exclude: ["password"] }
      }
    ]
  });

  if (!application) throw new apiError(404, "Application not found");
  if (application.Job.created_by !== req.user.id) {
    throw new apiError(403, "You cannot view this applicant");
  }

  return res.status(200)
    .json(new ApiResponse(200, application, "Application details fetched"));
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const appId = req.params.appId;
  const { status } = req.body;

  if (!["applied", "selected", "rejected"].includes(status))
    throw new apiError(400, "Invalid status");

  const application = await Application.findByPk(appId, {
    include: [Job],
  });

  if (!application) throw new apiError(404, "Application not found");
  if (application.Job.created_by !== req.user.id)
    throw new apiError(403, "Not allowed");

  application.status = status;
  await application.save();

  return res.status(200)
    .json(new ApiResponse(200, application, "Status updated"));
});