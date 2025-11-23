import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import db from "../models/index.js";

const { Job, CompanyUser, Company, Application } = db;

export const createJob = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const companyRecord = await CompanyUser.findOne({
    where: { user_id: userId },
  });

  if (!companyRecord) {
    throw new apiError(400, "Recruiter is not linked to any company");
  }
  const companyId = companyRecord.company_id;
  const { title, job_description, salary, city, state, country, job_type } = req.body;
  if (!title || !job_type) {
    throw new apiError(400, "Title and job_type are required");
  }
  if (!city || !state || !country) {
    throw new apiError(400, "City, state and country are required");
  }
  const newJob = await Job.create({
    company_id: companyId,
    created_by: userId,
    title,
    job_description,
    salary,
    city,
    state,
    country,
    job_type,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newJob, "Job posted successfully"));
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.findAll({
    where: { created_by: req.user.id },
    include: [{ model: Company }],
    order: [["created_at", "DESC"]],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

export const deleteJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const job = await Job.findOne({
    where: { id: jobId, created_by: req.user.id },
  });
  if (!job) throw new apiError(404, "Job not found");
  await job.destroy();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Job deleted successfully"));
});

export const getAllJobs = asyncHandler(async (req, res) => {
  const { search, city } = req.query;
  const where = {};
  if (search) {
    where.title = { [db.Sequelize.Op.iLike]: `%${search}%` };
  }
  if (city) {
    where.city = { [db.Sequelize.Op.iLike]: `%${city}%` };
  }
  const jobs = await Job.findAll({
    where,
    include: [{ model: Company }],
    order: [["created_at", "DESC"]],
  });
  return res
    .status(200)
    .json(new ApiResponse(200, jobs, "Jobs fetched"));
});

export const getSingleJob = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id, {
    include: [{ model: Company }],
  });
  if (!job) throw new apiError(404, "Job not found");
  return res
    .status(200)
    .json(new ApiResponse(200, job, "Job fetched"));
});

export const applyJob = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.id;
  const job = await Job.findByPk(jobId);
  if (!job) throw new apiError(404, "Job not found");
  if (job.created_by === userId)
    throw new apiError(400, "You cannot apply to your own job");
  const exists = await Application.findOne({
    where: {
      job_id: jobId,
      job_seeker_id: userId
    }
  });
  if (exists) {
    throw new apiError(400, "You already applied to this job");
  }
  const application = await Application.create({
    job_id: jobId,
    job_seeker_id: userId,
    status: "applied"
  });

  return res
    .status(201)
    .json(new ApiResponse(201, application, "Application submitted"));
});
