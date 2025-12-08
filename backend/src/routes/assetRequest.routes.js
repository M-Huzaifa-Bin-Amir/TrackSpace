import express from "express";
import {
  createAssetRequest,
  getAssetRequests,
  getAssetRequestById,
  updateAssetRequest,
  deleteAssetRequest,
} from "../controller/assetRequest.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// USER: create request
router.post("/", authMiddleware, createAssetRequest);

// ADMIN or USER: list requests (actual filtering/permissions can be in controller)
router.get("/", authMiddleware, getAssetRequests);

// ADMIN or OWNER: view single request (owner/admin check should be in controller)
router.get("/:id", authMiddleware, getAssetRequestById);

// ADMIN: update (status, handledBy)
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateAssetRequest
);

// ADMIN: delete
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAssetRequest
);

export default router;
