// src/services/assetRequestApi.js
import backend from "./backend";

/**
 * USER: create an asset request
 * body example:
 * {
 *   assetId: "<asset ObjectId> | null",
 *   requestType: "New" | "Replacement" | "Return" | "Maintenance",
 *   justification: "Need a laptop for project"
 * }
 */
export const createAssetRequestApi = (data) =>
  backend.post("/asset-requests", data);

/**
 * LIST requests.
 *
 * For admin:
 *   listAssetRequestsApi({ page, limit, status, requestType, userId })
 *
 * For normal user:
 *   listAssetRequestsApi({ page, limit, mine: true })
 * (backend already restricts to req.user when not admin / mine=true)
 */
export const listAssetRequestsApi = (params = {}) =>
  backend.get("/asset-requests", { params });

/**
 * Get a single request by id
 */
export const getAssetRequestByIdApi = (id) =>
  backend.get(`/asset-requests/${id}`);

/**
 * ADMIN: update a request
 * body can contain e.g.:
 * {
 *   status: "Pending" | "Approved" | "Rejected" | "Fulfilled",
 *   adminComment: "Approved for FY-25",
 *   handledBy: "<admin user id>" // usually filled by backend using req.user
 * }
 */
export const updateAssetRequestApi = (id, data) =>
  backend.patch(`/asset-requests/${id}`, data);

/**
 * ADMIN: delete a request
 */
export const deleteAssetRequestApi = (id) =>
  backend.delete(`/asset-requests/${id}`);
