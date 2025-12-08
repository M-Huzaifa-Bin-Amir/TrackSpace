// src/services/dashboardApi.js
import backend from "./backend";

// Admin dashboard summary
export const getAdminSummaryApi = () =>
  backend.get("/dashboard/admin-summary");

// Logged-in user's own summary
export const getMySummaryApi = () =>
  backend.get("/dashboard/my-summary");
