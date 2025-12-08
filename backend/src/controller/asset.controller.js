import Asset from "../models/asset.model.js";
import catchAsync from "../utils/catchAsync.js";

export const createAsset = catchAsync(async (req, res) => {
  let {
    serialNo,
    model,
    assetSubtype,
    status,
    purchaseDate,
    cost,
    category,
    vendor,
    location,
    hardware,
    software,
  } = req.body;

  // basic validation
  if (!serialNo || !assetSubtype) {
    return res
      .status(400)
      .json({ message: "serialNo and assetSubtype are required" });
  }

  // If hardware / software came as JSON string from multipart/form-data, parse them
  let hardwareData = hardware;
  let softwareData = software;

  if (hardware && typeof hardware === "string") {
    try {
      hardwareData = JSON.parse(hardware);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid hardware format (must be JSON)" });
    }
  }

  if (software && typeof software === "string") {
    try {
      softwareData = JSON.parse(software);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid software format (must be JSON)" });
    }
  }

  const data = {
    serialNo,
    model,
    assetSubtype,
    status,
    purchaseDate,
    cost,
    category,
    vendor,
    location,
    createdBy: req.user.id,
  };

  if (assetSubtype === "Hardware" && hardwareData) {
    data.hardware = hardwareData;
    data.software = undefined;
  }

  if (assetSubtype === "Software" && softwareData) {
    data.software = softwareData;
    data.hardware = undefined;
  }

  if (req.file) {
    data.imageUrl = `/uploads/${req.file.filename}`;
  }

  const asset = await Asset.create(data);
  res.status(201).json({ asset });
});

export const getAssets = catchAsync(async (req, res) => {
  const page  = parseInt(req.query.page, 10)  || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip  = (page - 1) * limit;

  const search    = req.query.search || "";
  const status    = req.query.status;
  const subtype   = req.query.subtype;
  const sortField = req.query.sort || "-createdAt";

  const query = {};

  if (search) {
    query.$or = [
      { serialNo: { $regex: search, $options: "i" } },
      { model:    { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }
  if (status) {
    query.status = status;
  }
  if (subtype) {
    query.assetSubtype = subtype;
  }

  const [items, total] = await Promise.all([
    Asset.find(query)
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role"),
    Asset.countDocuments(query),
  ]);

  res.json({
    page,
    limit,
    total,
    data: items,
  });
});

export const getAssetById = catchAsync(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate("createdBy", "name email role");

  if (!asset) {
    return res.status(404).json({ message: "Asset not found" });
  }

  res.json({ asset });
});

// ONLY creator or admin can update
export const updateAsset = catchAsync(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: "Asset not found" });

  const isOwner = asset.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const {
    serialNo,
    model,
    assetSubtype,
    status,
    purchaseDate,
    cost,
    category,
    vendor,
    location,
    hardware,
    software,
  } = req.body;

  if (serialNo !== undefined) asset.serialNo = serialNo;
  if (model !== undefined) asset.model = model;
  if (assetSubtype !== undefined) asset.assetSubtype = assetSubtype;
  if (status !== undefined) asset.status = status;
  if (purchaseDate !== undefined) asset.purchaseDate = purchaseDate;
  if (cost !== undefined) asset.cost = cost;
  if (category !== undefined) asset.category = category;
  if (vendor !== undefined) asset.vendor = vendor;
  if (location !== undefined) asset.location = location;

  if (asset.assetSubtype === "Hardware" && hardware !== undefined) {
    asset.hardware = hardware;
    asset.software = undefined;
  }
  if (asset.assetSubtype === "Software" && software !== undefined) {
    asset.software = software;
    asset.hardware = undefined;
  }

  if (req.file) {
    asset.imageUrl = `/uploads/${req.file.filename}`;
  }

  await asset.save();
  res.json({ asset });
});

// ONLY creator or admin can delete
export const deleteAsset = catchAsync(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: "Asset not found" });

  const isOwner = asset.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await asset.deleteOne();
  res.status(204).end();
});

// optional: list only assets created by the logged-in user
export const getMyAssets = catchAsync(async (req, res) => {
  const assets = await Asset.find({ createdBy: req.user.id });
  res.json({ data: assets });
});
