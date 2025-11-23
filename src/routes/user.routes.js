import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile,
  changePassword
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});

const upload = multer({ storage });
router.post("/register", upload.single("resume"), registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/logout", verifyJWT, logoutUser);
router.put("/update-profile", verifyJWT, upload.single("resume"), updateProfile);
router.put("/change-password", verifyJWT, changePassword);

export default router;