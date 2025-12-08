import express from "express";
import multer from "multer";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getMyAssets,
} from "../controller/asset.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// store images in /uploads/
const upload = multer({ dest: "uploads/" });

// ADMIN creates assets
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  createAsset
);

// any logged-in user can list assets
router.get("/", authMiddleware, getAssets);

// see my own created assets
router.get("/mine", authMiddleware, getMyAssets);

// get single asset
router.get("/:id", authMiddleware, getAssetById);

// update asset (owner or admin via controller logic)
router.patch(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updateAsset
);

// delete asset (owner or admin via controller logic)
router.delete("/:id", authMiddleware, deleteAsset);

export default router;
