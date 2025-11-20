import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { apiError } from "./utils/apiError.js";
import path from "path";
import { fileURLToPath } from "url";
import healthRouter from "./routes/health.routes.js";


const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", routes);
app.use("/api", healthRouter);
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  if (err instanceof apiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;