// routes/user.routes.js
import express from "express";
import { body, validationResult } from "express-validator";

import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  updateMyPassword,
} from "../controller/user.controller.js";

const router = express.Router();

// Reusable validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      errors: errors.array(),
    });
  }
  next();
};

// VALIDATION RULES

// For creating a user (admin)
const createUserValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

// For updating an existing user (admin)
const updateUserValidation = [
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

// For updating own profile
const updateMeValidation = [
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
];

// For changing own password
const updateMyPasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// ROUTES

// ===== SELF PROFILE ROUTES (must be BEFORE /:id) =====

// GET /api/users/me - get current user profile
router.get("/me", authMiddleware, getMe);

// PATCH /api/users/me - update own name/email
router.patch(
  "/me",
  authMiddleware,
  updateMeValidation,
  validate,
  updateMe
);

// PATCH /api/users/me/password - change own password
router.patch(
  "/me/password",
  authMiddleware,
  updateMyPasswordValidation,
  validate,
  updateMyPassword
);

// ===== ADMIN USER MANAGEMENT ROUTES =====

// GET /api/users - list users (admin only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);

// POST /api/users - create new user (admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createUserValidation,
  validate,
  createUser
);

// PATCH /api/users/:id - update existing user (admin only)
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserValidation,
  validate,
  updateUser
);

// DELETE /api/users/:id - delete user (admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

export default router;
