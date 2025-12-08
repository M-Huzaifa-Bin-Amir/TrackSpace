// src/services/assetsApi.js
import backend from "./backend";

// List assets with optional query params: page, limit, search, status, subtype, sort
export const listAssetsApi = (params = {}) =>
  backend.get("/assets", { params });

// Create a new asset (expects FormData for possible image upload)
export const createAssetApi = (formData) =>
  backend.post("/assets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete an asset by ID
export const deleteAssetApi = (id) =>
  backend.delete(`/assets/${id}`);

// (Optional) list only my assets
export const myAssetsApi = () =>
  backend.get("/assets/mine");
