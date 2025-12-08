// src/components/AssetRequestsPanel.js
import React, { useEffect, useState } from "react";
import {
  listAssetRequestsApi,
  createAssetRequestApi,
  updateAssetRequestApi,
} from "../services/assetRequestApi";
import { listAssetsApi } from "../services/assetsApi"; // we created earlier

const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Fulfilled: "bg-sky-100 text-sky-700",
};

const AssetRequestsPanel = ({ isAdmin }) => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [form, setForm] = useState({
    assetId: "",
    requestType: "New",
    justification: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAssetRequestsApi({
        page,
        limit,
        status: statusFilter || undefined,
        requestType: typeFilter || undefined,
        search: search || undefined,
      });
      const data = res.data || res;
      setRequests(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load requests";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await listAssetsApi({ page: 1, limit: 50 });
      const data = res.data || res;
      setAssets(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, typeFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.requestType) {
      setFormError("Request type is required");
      return;
    }

    try {
      setCreating(true);
      await createAssetRequestApi({
        assetId: form.assetId || undefined,
        requestType: form.requestType,
        justification: form.justification || undefined,
      });
      setFormSuccess("Request submitted");
      setForm({
        assetId: "",
        requestType: "New",
        justification: "",
      });
      setPage(1);
      await loadRequests();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit request";
      setFormError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAssetRequestApi(id, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update status"
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadRequests();
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {isAdmin ? "Asset Requests (All Users)" : "My Asset Requests"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Request new assets or track approvals. Admins can approve, reject or
          mark requests as fulfilled.
        </p>
      </div>

      {/* Create request form (everyone) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Create New Request
        </h3>

        {formError && (
          <div className="mb-3 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded">
            {formSuccess}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Related Asset (optional)
            </label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.assetId}
              onChange={(e) =>
                setForm((f) => ({ ...f, assetId: e.target.value }))
              }
            >
              <option value="">Not linked to a specific asset</option>
              {loadingAssets ? (
                <option disabled>Loading assets…</option>
              ) : (
                assets.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.serialNo} — {a.model} ({a.assetSubtype})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Request Type
            </label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.requestType}
              onChange={(e) =>
                setForm((f) => ({ ...f, requestType: e.target.value }))
              }
              required
            >
              <option value="New">New</option>
              <option value="Replacement">Replacement</option>
              <option value="Return">Return</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Justification
            </label>
            <textarea
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.justification}
              onChange={(e) =>
                setForm((f) => ({ ...f, justification: e.target.value }))
              }
              placeholder="Explain why this asset is needed…"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* Filters + table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 items-center"
          >
            <input
              placeholder="Search justification…"
              className="w-full md:w-64 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          <div className="flex gap-2 items-center">
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All types</option>
              <option value="New">New</option>
              <option value="Replacement">Replacement</option>
              <option value="Return">Return</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 text-xs text-red-700 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              Loading requests…
            </div>
          ) : (
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  {isAdmin && (
                    <th className="px-4 py-2 text-left">User</th>
                  )}
                  <th className="px-4 py-2 text-left">Asset</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Justification</th>
                  {isAdmin && (
                    <th className="px-4 py-2 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id}>
                      {isAdmin && (
                        <td className="px-4 py-2">
                          {r.user?.name || "—"}
                          <span className="block text-[10px] text-slate-500">
                            {r.user?.email}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-2">
                        {r.asset
                          ? `${r.asset.serialNo} ${r.asset.model || ""}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {r.requestType}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            statusColors[r.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 max-w-xs">
                        <span className="text-[11px] text-slate-600 line-clamp-2">
                          {r.justification || "—"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-2 text-right space-x-1">
                          <button
                            onClick={() =>
                              handleStatusChange(r._id, "Approved")
                            }
                            className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(r._id, "Rejected")
                            }
                            className="text-[10px] px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(r._id, "Fulfilled")
                            }
                            className="text-[10px] px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200"
                          >
                            Fulfill
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssetRequestsPanel;
