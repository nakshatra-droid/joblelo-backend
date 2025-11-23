import { apiError } from "../utils/apiError.js";

export const isRecruiter = (req, res, next) => {
  if (!req.user.roles.includes("recruiter"))
    throw new apiError(403, "Access denied. Recruiter only.");
  next();
};

export const isSeeker = (req, res, next) => {
  if (!req.user.roles.includes("seeker"))
    throw new apiError(403, "Access denied. Job seeker only.");
  next();
};
