// src/components/ProfilePanel.js
import React, { useEffect, useState } from "react";
import {
  getMeApi,
  updateMeApi,
  updateMyPasswordApi,
} from "../services/userApi";

const ProfilePanel = () => {
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setProfileError("");
      try {
        const res = await getMeApi();
        const data = res.data || res;
        const u = data.user;
        setProfileForm({
          name: u?.name || "",
          email: u?.email || "",
        });
      } catch (err) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load profile";
        setProfileError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    try {
      setUpdatingProfile(true);
      await updateMeApi(profileForm);
      setProfileSuccess("Profile updated successfully");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile";
      setProfileError(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      setPwdError("Both fields are required");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters");
      return;
    }

    try {
      setUpdatingPwd(true);
      await updateMyPasswordApi(pwdForm);
      setPwdSuccess("Password updated successfully");
      setPwdForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password";
      setPwdError(msg);
    } finally {
      setUpdatingPwd(false);
    }
  };

  return (
    <section className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          My Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Update your basic information and change your password.
        </p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Basic Information
        </h3>

        {profileError && (
          <div className="text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded">
            {profileSuccess}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading profile…</p>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Name
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {updatingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        )}
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Change Password
        </h3>

        {pwdError && (
          <div className="text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {pwdError}
          </div>
        )}
        {pwdSuccess && (
          <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded">
            {pwdSuccess}
          </div>
        )}

        <form onSubmit={handlePwdSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={pwdForm.currentPassword}
              onChange={(e) =>
                setPwdForm((f) => ({
                  ...f,
                  currentPassword: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingPwd}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-60"
          >
            {updatingPwd ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ProfilePanel;
