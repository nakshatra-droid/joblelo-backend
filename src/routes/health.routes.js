import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Joblelo backend is running"
  });
});

export default router;
