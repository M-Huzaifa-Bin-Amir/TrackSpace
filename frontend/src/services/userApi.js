// src/services/userApi.js
import backend from "./backend";

/**
 * ADMIN: list users
 * Supports: ?page=&limit=&search=&role=
 */
export const listUsersApi = (params = {}) =>
  backend.get("/users", { params });

/**
 * ADMIN: create a new user
 * body example:
 * {
 *   name: "Bilal",
 *   email: "bilal@example.com",
 *   password: "Secret123!",
 *   role: "user" | "admin"
 * }
 */
export const createUserApi = (data) =>
  backend.post("/users", data);

/**
 * ADMIN: update an existing user
 * body can contain: { name, email, role, isActive }
 */
export const updateUserApi = (id, data) =>
  backend.patch(`/users/${id}`, data);

/**
 * ADMIN: delete a user
 */
export const deleteUserApi = (id) =>
  backend.delete(`/users/${id}`);

/**
 * SELF: get my own profile (/api/users/me)
 */
export const getMeApi = () =>
  backend.get("/users/me");

/**
 * SELF: update my profile (name/email etc)
 * body example: { name: "New Name", email: "new@mail.com" }
 */
export const updateMeApi = (data) =>
  backend.patch("/users/me", data);

/**
 * SELF: change my password
 * backend expects: { currentPassword, newPassword }
 */
export const updateMyPasswordApi = (data) =>
  backend.patch("/users/me/password", data);
