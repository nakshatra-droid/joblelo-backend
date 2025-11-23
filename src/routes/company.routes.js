import express from "express";
import { getAllCompanies } from "../controllers/company.controller.js";

const router = express.Router();

// Public endpoint to list all companies
router.get("/", getAllCompanies);

export default router;


