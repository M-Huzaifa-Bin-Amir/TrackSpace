// tests/auth.helper.js
import jwt from "jsonwebtoken";
import User from "../src/models/user.model.js";

/**
 * Create a test user directly in MongoDB and return user + JWT access token.
 * Role can be "user" or "admin".
 */
export const createTestUser = async (role = "user") => {
  const email = `${role}_${Date.now()}@test.com`;

  const user = await User.create({
    name: role.toUpperCase() + " TEST",
    email,
    password: "password123", // will be hashed by pre-save hook
    role,                     // relies on your userSchema.role definition
  });

  const accessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  return { user, token: accessToken };
};
