import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import assetRoutes from "./routes/asset.routes.js";
import assetRequestRoutes from "./routes/assetRequest.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Basic security & parsing
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());          // <-- parses JSON body into req.body
app.use(cookieParser());

// NO xss-clean
// NO express-mongo-sanitize
// NO custom req.body rewriting

// Rate limiter on /api
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

// Static uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/asset-requests", assetRequestRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);

// Error handler
app.use(errorHandler);

export default app;
