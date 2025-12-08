// controller/assetRequest.controller.js
import AssetRequest from "../models/assetRequest.model.js";
import Asset from "../models/asset.model.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * USER: create a new request for an asset
 * Body: { assetId?, requestType, justification? }
 */
export const createAssetRequest = catchAsync(async (req, res) => {
  const { assetId, requestType, justification } = req.body;

  if (!requestType) {
    return res.status(400).json({ message: "requestType is required" });
  }

  const request = await AssetRequest.create({
    user: req.user.id,
    asset: assetId || null,
    requestType,
    justification,
    status: "Pending",
  });

  res.status(201).json({ request });
});

/**
 * ADMIN or USER: list requests
 * - admin sees all
 * - normal user sees only their own
 *
 * Supports query params:
 *   ?page=&limit=&status=&requestType=&search=&sort=
 *   - search currently matches justification (case-insensitive)
 */
export const getAssetRequests = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status, requestType, search } = req.query;
  const sortField = req.query.sort || "-createdAt";

  const query = {};

  if (status) query.status = status;
  if (requestType) query.requestType = requestType;

  if (search) {
    const regex = new RegExp(search, "i");
    query.justification = regex;
  }

  // non-admin: only their own requests
  if (req.user.role !== "admin") {
    query.user = req.user.id;
  }

  const [requests, total] = await Promise.all([
    AssetRequest.find(query)
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("asset", "serialNo model"),
    AssetRequest.countDocuments(query),
  ]);

  res.json({
    page,
    limit,
    total,
    data: requests,
  });
});

/**
 * ADMIN or OWNER: view a single request
 */
export const getAssetRequestById = catchAsync(async (req, res) => {
  const request = await AssetRequest.findById(req.params.id)
    .populate("user", "name email")
    .populate("asset", "serialNo model");

  if (!request) {
    return res.status(404).json({ message: "AssetRequest not found" });
  }

  const isOwner = request.user._id.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not allowed" });
  }

  res.json({ request });
});

/**
 * ADMIN: update request (status / handledBy) + sync related Asset.status
 *
 * Body: { status?, handledBy? }
 *
 * Rules for Asset.status (only if request.asset is set and we change status):
 *   - requestType = "New" or "Replacement":
 *       status = "Approved" or "Fulfilled"  -> asset.status = "Assigned"
 *   - requestType = "Maintenance":
 *       status = "Approved" or "Fulfilled"  -> asset.status = "Under Maintenance"
 *   - requestType = "Return":
 *       status = "Approved" or "Fulfilled"  -> asset.status = "Available"
 *   - "Rejected" or anything else: asset status unchanged
 */
export const updateAssetRequest = catchAsync(async (req, res) => {
  const request = await AssetRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: "AssetRequest not found" });
  }

  const { status, handledBy } = req.body;

  if (status) request.status = status;
  if (handledBy) {
    request.handledBy = handledBy;
  } else {
    // by default, current admin handled this
    request.handledBy = req.user.id;
  }

  await request.save();

  // ---- STEP 5: sync Asset.status with request decision ----
  if (status && request.asset) {
    const asset = await Asset.findById(request.asset);

    if (asset) {
      const isApprovedOrFulfilled =
        status === "Approved" || status === "Fulfilled";

      if (isApprovedOrFulfilled) {
        if (
          request.requestType === "New" ||
          request.requestType === "Replacement"
        ) {
          asset.status = "Assigned"; // asset now assigned to user
        } else if (request.requestType === "Maintenance") {
          asset.status = "Under Maintenance";
        } else if (request.requestType === "Return") {
          asset.status = "Available";
        }

        await asset.save();
      }
      // If status is "Rejected", we do NOT change asset.status
    }
  }

  res.json({ request });
});

/**
 * ADMIN: delete request
 */
export const deleteAssetRequest = catchAsync(async (req, res) => {
  const request = await AssetRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: "AssetRequest not found" });
  }

  await request.deleteOne();
  res.status(204).end();
});
