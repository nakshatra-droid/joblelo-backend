import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import db from "../models/index.js";

const { Company } = db;

export const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.findAll({
    order: [["name", "ASC"]],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, companies, "Companies fetched successfully"));
});


