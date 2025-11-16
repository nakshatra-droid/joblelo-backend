import express from "express";
import healthRouter from "./routes/health.routes.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", healthRouter);

export default app;
