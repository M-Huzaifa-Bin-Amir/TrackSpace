// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import {
  getAdminSummaryApi,
  getMySummaryApi,
} from "../services/dashboardApi";
import UserManagementPanel from "../components/UserManagementPanel";
import AssetRequestsPanel from "../components/AssetRequestsPanel";
import ProfilePanel from "../components/ProfilePanel";

const StatCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    {accent && (
      <p className="mt-1 text-xs font-medium text-slate-500">{accent}</p>
    )}
  </div>
);

const Pills = ({ options, active, onChange }) => (
  <div className="inline-flex rounded-full bg-slate-100 p-1">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-4 py-1 text-xs md:text-sm rounded-full font-medium transition ${
          active === opt.value
            ? "bg-white shadow text-indigo-600"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const DashboardPage = ({ user }) => {
  const isAdmin = user?.role === "admin";
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      setSummaryError("");
      try {
        const res = isAdmin
          ? await getAdminSummaryApi()
          : await getMySummaryApi();
        // services return res.data, so res already = data
        setSummary(res);
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard summary";
        setSummaryError(msg);
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [isAdmin]);

  const adminTabs = [
    { value: "overview", label: "Overview" },
    { value: "users", label: "Users" },
    { value: "requests", label: "Asset Requests" },
    { value: "profile", label: "My Profile" },
  ];

  const userTabs = [
    { value: "overview", label: "Overview" },
    { value: "requests", label: "My Requests" },
    { value: "profile", label: "My Profile" },
  ];

  const cards = summary?.cards || {};
  const recent = summary?.recent || {};

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Signed in as{" "}
            <span className="font-semibold">
              {user?.name} ({user?.role})
            </span>
          </p>
        </div>

        <Pills
          options={isAdmin ? adminTabs : userTabs}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* SUMMARY SECTION */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {summaryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {summaryError}
            </div>
          )}

          {loadingSummary ? (
            <div className="text-sm text-slate-500">Loading summary…</div>
          ) : (
            <>
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isAdmin ? (
                  <>
                    <StatCard
                      label="Total Assets"
                      value={cards.totalAssets ?? 0}
                      accent={`${cards.totalHardware ?? 0} hardware • ${
                        cards.totalSoftware ?? 0
                      } software`}
                    />
                    <StatCard
                      label="Asset Requests"
                      value={cards.totalRequests ?? 0}
                      accent={`${cards.pendingRequests ?? 0} pending`}
                    />
                    <StatCard
                      label="Users"
                      value={cards.totalUsers ?? 0}
                      accent={`${cards.adminCount ?? 0} admins`}
                    />
                    <StatCard
                      label="System Health"
                      value="OK"
                      accent="JWT, RBAC, pagination enabled"
                    />
                  </>
                ) : (
                  <>
                    <StatCard
                      label="Assets I Created"
                      value={cards.myAssetsCount ?? 0}
                    />
                    <StatCard
                      label="My Requests"
                      value={cards.myRequestsCount ?? 0}
                      accent={`${cards.myPendingRequestsCount ?? 0} pending`}
                    />
                    <StatCard
                      label="Role"
                      value={user?.role ?? "user"}
                      accent={user?.email}
                    />
                    <StatCard
                      label="System Health"
                      value="OK"
                      accent="JWT, RBAC, pagination enabled"
                    />
                  </>
                )}
              </div>

              {/* Recent tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent assets */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                      Recent Assets
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Serial</th>
                          <th className="px-4 py-2 text-left">Model</th>
                          <th className="px-4 py-2 text-left">Subtype</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(recent.assets || []).length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-4 text-slate-500 text-center"
                            >
                              No recent assets.
                            </td>
                          </tr>
                        ) : (
                          recent.assets.map((a) => (
                            <tr key={a._id}>
                              <td className="px-4 py-2">{a.serialNo}</td>
                              <td className="px-4 py-2">{a.model}</td>
                              <td className="px-4 py-2 text-slate-500">
                                {a.assetSubtype}
                              </td>
                              <td className="px-4 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent requests */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                      Recent Requests
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase">
                        <tr>
                          {isAdmin && (
                            <th className="px-4 py-2 text-left">User</th>
                          )}
                          <th className="px-4 py-2 text-left">Asset</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(recent.requests || []).length === 0 ? (
                          <tr>
                            <td
                              colSpan={isAdmin ? 4 : 3}
                              className="px-4 py-4 text-slate-500 text-center"
                            >
                              No recent requests.
                            </td>
                          </tr>
                        ) : (
                          recent.requests.map((r) => (
                            <tr key={r._id}>
                              {isAdmin && (
                                <td className="px-4 py-2">
                                  {r.user?.name || "—"}
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
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* USERS (ADMIN ONLY) */}
      {activeTab === "users" && isAdmin && <UserManagementPanel />}

      {/* REQUESTS (admin sees all, user sees own) */}
      {activeTab === "requests" && (
        <AssetRequestsPanel isAdmin={isAdmin} />
      )}

      {/* PROFILE (everyone) */}
      {activeTab === "profile" && <ProfilePanel />}
    </div>
  );
};

export default DashboardPage;
