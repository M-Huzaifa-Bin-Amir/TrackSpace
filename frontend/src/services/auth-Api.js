// src/services/authApi.js
import backend from "./backend";

// Adjust field names here if your backend returns something different.
// I'm assuming:
// - POST /auth/login  -> { message, accessToken, refreshToken?, user }
// - POST /auth/register -> { message, user } (or similar)
// - GET /auth/me -> { user }

export const loginApi = ({ email, password }) =>
  backend.post("/auth/login", { email, password });

export const registerApi = ({ name, email, password }) =>
  backend.post("/auth/register", { name, email, password });

export const meApi = () => backend.get("/auth/me");
