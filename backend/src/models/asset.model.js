import mongoose from "mongoose";

const hardwareSchema = new mongoose.Schema({
  cpu: String,
  ram: String,
  storage: String,
  gpu: String,
  motherboard: String,
  peripherals: [String],  // e.g. ["Mouse", "Keyboard"]
}, { _id: false });

const softwareSchema = new mongoose.Schema({
  title: String,          // e.g. "Windows 11 Pro"
  version: String,
  publisher: String,
  licenseKey: String,
  installedLocation: String,
  expiryDate: Date,
}, { _id: false });

const assetSchema = new mongoose.Schema({
  serialNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  assetSubtype: {
    type: String,
    enum: ["Hardware", "Software"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Available", "Assigned", "Under Maintenance", "Retired"],
    default: "Available",
  },
  purchaseDate: Date,
  cost: Number,

  category: String,     // "Laptop", "Server", "License", etc.
  vendor: String,
  location: String,

  hardware: hardwareSchema,   // only meaningful when assetSubtype = "Hardware"
  software: softwareSchema,   // only meaningful when assetSubtype = "Software"

  imageUrl: String,           // /uploads/<filename>

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Asset", assetSchema);
