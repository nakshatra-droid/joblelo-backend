import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import db from "../models/index.js";

const { User, Role, UserRole, Company, CompanyUser } = db;
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};
export const registerUser = asyncHandler(async (req, res) => {
  const {
    role,
    full_name,
    email,
    phone,
    password,
    city,
    state,
    country,
    experience,
    workMail,
    company,
  } = req.body;

  if (!role || !full_name || !email || !password) {
    throw new apiError(400, "Required fields missing");
  }
  if (role === "seeker" && (!city || !state || !country)) {
    throw new apiError(400, "City, state and country are required for job seekers");
  }
  const existingUser = await User.findOne({
    where: { email },
    include: [{ model: Role, through: { attributes: [] }, attributes: ["name"] }],
  });

  let targetUser = existingUser;
  if (existingUser) {
    const existingRoles = existingUser.Roles?.map((r) => r.name) ?? [];
    if (existingRoles.includes(role)) {
      // Same email and same role already registered – do not allow
      throw new apiError(
        409,
        `Email is already registered as ${role}. Please login instead.`
      );
    }

    // Verify password matches for existing user before adding new role
    const passwordMatch = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new apiError(401, "Incorrect password. Password must match your existing account.");
    }

    // Update common fields (can be updated regardless of role)
    existingUser.full_name = full_name ?? existingUser.full_name;
    existingUser.phone = phone ?? existingUser.phone;

    // Update role-specific fields on the existing user
    if (role === "seeker") {
      existingUser.city = city ?? existingUser.city;
      existingUser.state = state ?? existingUser.state;
      existingUser.country = country ?? existingUser.country;
      existingUser.experience = experience ?? existingUser.experience;
      if (req.file) {
        existingUser.resume_url = `/uploads/resumes/${req.file.filename}`;
      }
    } else if (role === "recruiter") {
      existingUser.work_email = workMail ?? existingUser.work_email;
      existingUser.company = company ?? existingUser.company;
    }

    await existingUser.save();
  } else {
    // No user with this email – create a fresh one
    targetUser = await User.create({
      full_name,
      email,
      phone,
      password,
      city: role === "seeker" ? city : null,
      state: role === "seeker" ? state : null,
      country: role === "seeker" ? country : null,
      experience: role === "seeker" ? experience : null,
      resume_url: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      work_email: role === "recruiter" ? workMail : null,
      company: role === "recruiter" ? company : null,
    });
  }

  let roleRecord = await Role.findOne({ where: { name: role } });
  if (!roleRecord) roleRecord = await Role.create({ name: role });

  // Check if UserRole already exists (shouldn't happen due to earlier check, but safety check)
  const existingUserRole = await UserRole.findOne({
    where: { user_id: targetUser.id, role_id: roleRecord.id }
  });
  if (!existingUserRole) {
    await UserRole.create({
      user_id: targetUser.id,
      role_id: roleRecord.id,
    });
  }

  if (role === "recruiter") {
    if (!company) throw new apiError(400, "Company name is required");
    let existingCompany = await Company.findOne({ where: { name: company } });
    if (!existingCompany) {
      existingCompany = await Company.create({ name: company });
    }
    // Check if CompanyUser association already exists
    const existingCompanyUser = await CompanyUser.findOne({
      where: { user_id: targetUser.id, company_id: existingCompany.id }
    });
    if (!existingCompanyUser) {
      await CompanyUser.create({
        company_id: existingCompany.id,
        user_id: targetUser.id,
      });
    }
  }
  // Fetch user with all roles for response
  const userWithRoles = await User.findByPk(targetUser.id, {
    attributes: { exclude: ["password"] },
    include: [{ model: Role, through: { attributes: [] }, attributes: ["name"] }],
  });

  const allUserRoles = userWithRoles.Roles?.map((r) => r.name) ?? [];
  const formattedUser = {
    ...userWithRoles.toJSON(),
    roles: allUserRoles,
    role: role, // Current role being registered
  };

  const accessToken = targetUser.generateAccessToken(role);
  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        {
          user: formattedUser,
          token: accessToken,
        },
        existingUser
          ? `Successfully added ${role} role to your account`
          : "User registered successfully"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    throw new apiError(400, "Email, password and role are required");
  }
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, through: { attributes: [] }, attributes: ["name"] }],
  });
  if (!user) throw new apiError(404, "User does not exist");
  const match = await user.comparePassword(password);
  if (!match) throw new apiError(401, "Incorrect password");
  const userRoles = user.Roles?.map((r) => r.name) ?? [];
  if (!userRoles.includes(role)) {
    throw new apiError(
      403,
      `You do not have permission to login as a ${role}. Your roles: ${userRoles.join(", ")}`
    );
  }
  const accessToken = user.generateAccessToken(role);
  const formatted = {
    ...user.toJSON(),
    roles: userRoles,
    role,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: formatted, token: accessToken },
        "Login successful"
      )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: [{ model: Role, through: { attributes: [] }, attributes: ["name"] }],
  });
  if (!user) throw new apiError(404, "User not found");
  // Use role from token (set during login/register) or fallback to first role
  const role = req.user.role || req.user.roles?.[0];
  const allRoles = user.Roles?.map((r) => r.name) ?? [];
  let safeUser = null;
  if (role === "seeker") {
    safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      state: user.state,
      country: user.country,
      experience: user.experience,
      resume_url: user.resume_url,
      role: "seeker",
    };
  }
  else if (role === "recruiter") {
    safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      work_email: user.work_email,
      company: user.company,
      role: "recruiter",
    };
  }
  else {
    throw new apiError(400, "User has an unknown role");
  }
  // Include all roles in response
  safeUser.roles = allRoles;
  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "Current user fetched"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, phone, city, state, country, experience, work_email, company } = req.body;
  console.log("Incoming body:", req.body);
  const user = await User.findByPk(req.user.id);
  if (!user) throw new apiError(404, "User not found");
  user.full_name = full_name ?? user.full_name;
  user.phone = phone ?? user.phone;
  user.city = city ?? user.city;
  user.state = state ?? user.state;
  user.country = country ?? user.country;
  user.experience = experience ?? user.experience;
  user.work_email = work_email ?? user.work_email;
  user.company = company ?? user.company;
  if (req.file) {
    user.resume_url = `/uploads/resumes/${req.file.filename}`;
  }

  // if (req.file) user.resume_url = req.file.path;
  await user.save();
  return res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) throw new apiError(404, "User not found");
  const valid = await user.comparePassword(oldPassword);
  if (!valid) throw new apiError(401, "Incorrect old password");
  user.password = newPassword;
  await user.save();
  return res.status(200).json(new ApiResponse(200, null, "Password updated"));
});
