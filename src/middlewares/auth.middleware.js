import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import db from "../models/index.js";

const { User, Role } = db;

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new apiError(401, "Unauthorized request");
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new apiError(401, "Invalid or expired token");
  }
  const user = await User.findByPk(decoded.id, {
    attributes: {
      exclude: ["password"],
    },
    include: [
      {
        model: Role,
        through: { attributes: [] },
        attributes: ["name"],
      },
    ],
  });
  if (!user) throw new apiError(404, "User not found");
  const roles = user.Roles?.map((r) => r.name) ?? [];
  req.user = {
    ...user.toJSON(),
    roles,
    role: decoded.role || roles[0] || null,
  };

  next();
});
