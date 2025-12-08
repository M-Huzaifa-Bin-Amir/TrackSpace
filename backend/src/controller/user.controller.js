// controller/user.controller.js
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import { sendEmail } from "../utils/email.js";

/**
 * ADMIN: GET /api/users
 * Supports: ?page=&limit=&search=&role=
 */
export const getUsers = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, role } = req.query;

  const query = {};

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [{ name: regex }, { email: regex }];
  }

  if (role) {
    query.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    users,
  });
});

/**
 * ADMIN: POST /api/users
 * Body: { name, email, password, role? }
 */
export const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({
    name,
    email,
    password, // will be hashed by user model pre-save hook
    role: role || "user",
  });

  await user.save();

  res.status(201).json({
    message: "User created successfully",
    user,
  });
});

/**
 * ADMIN: PATCH /api/users/:id
 * Body: { name?, email?, role? }
 */
export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If email is being changed, ensure it's not already used by someone else
  if (email && email !== user.email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken && emailTaken._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    user.email = email;
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (role !== undefined) {
    user.role = role; // "user" | "admin"
  }

  await user.save();

  res.json({
    message: "User updated successfully",
    user,
  });
});

/**
 * ADMIN: DELETE /api/users/:id
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();

  res.json({
    message: "User deleted successfully",
  });
});

/**
 * SELF: GET /api/users/me
 * Get current logged-in user's profile
 */
export const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
});

/**
 * SELF: PATCH /api/users/me
 * Update own profile (name/email)
 * Body: { name?, email? }
 */
export const updateMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (email && email !== user.email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken && emailTaken._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    user.email = email;
  }

  if (name !== undefined) {
    user.name = name;
  }

  await user.save();

  res.json({
    message: "Profile updated successfully",
    user,
  });
});

/**
 * SELF: PATCH /api/users/me/password
 * Body: { currentPassword, newPassword }
 */
export const updateMyPassword = catchAsync(async (req, res) => {
  const userId = req.user.id; // req.user.id is set by authMiddleware
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "currentPassword and newPassword are required" });
  }

  // Fetch user WITH password
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ message: "Current password is incorrect" });
  }

  // Set new password (will be hashed in pre-save hook)
  user.password = newPassword;
  await user.save();

  // 🔔 Try to send notification email (but don't fail the request if email breaks)
  if (user.email) {
    try {
      const when = new Date().toLocaleString();
      await sendEmail({
        to: user.email,
        subject: "Your TrackSphere password was changed",
        text: `Hi ${user.name || ""},

Your password on TrackSphere was changed on ${when}.

If this was you, no further action is needed.
If this wasn't you, please contact your administrator immediately.

– TrackSphere Security`,
      });
    } catch (err) {
      console.error("Error sending password change email:", err);
      // Don't block the response
    }
  }

  res.json({
    message: "Password updated successfully",
  });
});

