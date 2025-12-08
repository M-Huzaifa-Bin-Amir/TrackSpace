// controller/dashboard.controller.js
import Asset from "../models/asset.model.js";
import AssetRequest from "../models/assetRequest.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * ADMIN DASHBOARD SUMMARY
 * Route: GET /api/dashboard/admin-summary
 * Access: Admin only (protected in routes)
 */
export const getAdminSummary = catchAsync(async (req, res) => {
  // Basic counts for cards
  const [
    totalAssets,
    totalHardware,
    totalSoftware,
    totalRequests,
    pendingRequests,
    totalUsers,
    adminCount,
  ] = await Promise.all([
    Asset.countDocuments(),                                  // all assets
    Asset.countDocuments({ assetSubtype: "Hardware" }),      // hardware assets
    Asset.countDocuments({ assetSubtype: "Software" }),      // software assets
    Asset.countDocuments(),                                  // all requests
    AssetRequest.countDocuments({ status: "Pending" }),      // pending requests
    User.countDocuments(),                                   // all users
    User.countDocuments({ role: "admin" }),                  // admin users
  ]);

  // Group assets by status (for charts)
  const assetsByStatusRaw = await Asset.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Group requests by status (for charts)
  const requestsByStatusRaw = await AssetRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const assetsByStatus = assetsByStatusRaw.map((item) => ({
    status: item._id,
    count: item.count,
  }));

  const requestsByStatus = requestsByStatusRaw.map((item) => ({
    status: item._id,
    count: item.count,
  }));

  // Recent activity for tables
  const recentAssets = await Asset.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("serialNo model status assetSubtype createdAt");

  const recentRequests = await AssetRequest.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email")
    .populate("asset", "serialNo model")
    .select("requestType status createdAt");

  return res.json({
    cards: {
      totalAssets,
      totalHardware,
      totalSoftware,
      totalRequests,
      pendingRequests,
      totalUsers,
      adminCount,
    },
    charts: {
      assetsByStatus,
      requestsByStatus,
    },
    recent: {
      assets: recentAssets,
      requests: recentRequests,
    },
  });
});

/**
 * USER DASHBOARD SUMMARY
 * Route: GET /api/dashboard/my-summary
 * Access: Any logged-in user
 *
 * Uses req.user.id (set by authMiddleware)
 */
export const getMySummary = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Cards: how many assets I created, how many requests I made
  const [myAssetsCount, myRequestsCount, myPendingRequestsCount] =
    await Promise.all([
      Asset.countDocuments({ createdBy: userId }),
      AssetRequest.countDocuments({ user: userId }),
      AssetRequest.countDocuments({ user: userId, status: "Pending" }),
    ]);

  // Recent assets created by me
  const myRecentAssets = await Asset.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("serialNo model status assetSubtype createdAt");

  // Recent requests made by me
  const myRecentRequests = await AssetRequest.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("asset", "serialNo model")
    .select("requestType status createdAt");

  return res.json({
    cards: {
      myAssetsCount,
      myRequestsCount,
      myPendingRequestsCount,
    },
    recent: {
      assets: myRecentAssets,
      requests: myRecentRequests,
    },
  });
});
