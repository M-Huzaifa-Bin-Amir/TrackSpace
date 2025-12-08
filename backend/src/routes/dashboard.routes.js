// routes/dashboard.routes.js
import express from "express";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";
import {
  getAdminSummary,
  getMySummary,
} from "../controller/dashboard.controller.js";

const router = express.Router();

// ADMIN dashboard summary (global stats)
router.get(
  "/admin-summary",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminSummary
);

// USER dashboard summary (per-user stats)
router.get("/my-summary", authMiddleware, getMySummary);

export default router;
