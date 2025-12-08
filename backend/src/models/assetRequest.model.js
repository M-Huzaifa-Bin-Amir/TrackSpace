import mongoose from "mongoose";

const assetRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
    // optional: might be null if user is asking for "any laptop"
  },
  requestType: {
    type: String,
    enum: ["New", "Replacement", "Return", "Maintenance"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Fulfilled"],
    default: "Pending",
  },
  justification: {
    type: String,
    trim: true,
  },
  // which admin handled it (optional)
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model("AssetRequest", assetRequestSchema);
