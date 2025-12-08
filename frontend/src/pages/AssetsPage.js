// src/pages/AssetsPage.js
import React, { useState, useEffect } from "react";
import { listAssetsApi, deleteAssetApi } from "../services/assetsApi";

const AssetsPage = ({ user, setCurrentPage }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);

  // Load assets from backend on mount
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listAssetsApi({
          page: 1,
          limit: 50, // simple for now
        });
        // backend: { page, limit, total, data }
        setAssets(res.data.data || []);
      } catch (err) {
        console.error("Error fetching assets:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch assets";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const isAdmin = user?.role === "admin";

  const canDeleteAsset = (asset) => {
    const ownerId =
      typeof asset.createdBy === "object"
        ? asset.createdBy._id
        : asset.createdBy;
    return isAdmin || ownerId === user.id;
  };

  const handleDelete = async (asset) => {
    if (!canDeleteAsset(asset)) {
      alert("You are not allowed to delete this asset.");
      return;
    }

    const label = asset.model || asset.serialNo || asset._id;
    if (!window.confirm(`Are you sure you want to delete asset: ${label}?`)) {
      return;
    }

    try {
      await deleteAssetApi(asset._id);
      setAssets((prev) => prev.filter((a) => a._id !== asset._id));
    } catch (err) {
      console.error("Error deleting asset:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error deleting asset";
      alert(msg);
    }
  };

  // Search filter (by “name”/type/location)
  const filtered = assets.filter((a) => {
    const q = query.toLowerCase();
    const name = (a.model || a.serialNo || "").toLowerCase();
    const type = (a.category || a.assetSubtype || "").toLowerCase();
    const location = (a.location || "").toLowerCase();

    return (
      name.includes(q) || type.includes(q) || location.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-[#340158] font-semibold">
        Loading Asset Inventory...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#340158]">
          Asset Inventory
        </h1>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets..."
            className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
          />
          {isAdmin && (
            <button
              onClick={() => setCurrentPage("add-asset")}
              className="bg-[#7e3ff2] hover:bg-[#4B0082] text-white px-4 py-2 rounded-lg font-bold shadow-md transition"
            >
              Add New Asset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Asset Table - same feel as your old one */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse table-auto">
            <thead className="bg-[#4B0082] text-white uppercase text-sm font-bold">
              <tr>
                <th className="p-4">Asset Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-6 text-center text-gray-500"
                  >
                    No matching assets found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a._id}
                    className="hover:bg-purple-50 transition"
                  >
                    {/* Asset Name -> use model if available, else serialNo */}
                    <td className="p-4 font-medium text-[#340158]">
                      {a.model || a.serialNo || "-"}
                    </td>

                    {/* Type -> category (Laptop/Server/License) or fallback to assetSubtype */}
                    <td className="p-4 text-gray-600">
                      {a.category || a.assetSubtype || "-"}
                    </td>

                    <td className="p-4 text-gray-600">
                      {a.location || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold 
                          ${
                            a.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : a.status === "Under Maintenance"
                              ? "bg-yellow-100 text-yellow-700"
                              : a.status === "Assigned"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {a.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {canDeleteAsset(a) && (
                        <button
                          onClick={() => handleDelete(a)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          Delete
                        </button>
                      )}
                      {/* You can add Edit later */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;
