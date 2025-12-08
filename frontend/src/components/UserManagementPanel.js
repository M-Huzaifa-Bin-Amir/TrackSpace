// src/components/UserManagementPanel.js
import React, { useEffect, useState } from "react";
import {
  listUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../services/userApi";

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listUsersApi({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      const data = res.data || res; // in case service is wrapping data
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load users";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError("All fields are required");
      return;
    }

    if (createForm.password.length < 6) {
      setCreateError("Password must be at least 6 characters");
      return;
    }

    try {
      setCreating(true);
      await createUserApi(createForm);
      setCreateSuccess("User created successfully");
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "user",
      });
      setPage(1);
      await loadUsers();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create user";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await updateUserApi(id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? {
                ...u,
                role: newRole,
              }
            : u
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update role"
      );
    }
  };

  const handleDelete = async (id, email) => {
    if (
      !window.confirm(`Are you sure you want to delete user "${email}"?`)
    )
      return;

    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete user"
      );
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          User Management
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Admin can add, remove, and change roles for users.
        </p>
      </div>

      {/* Create user form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Add New User
        </h3>

        {createError && (
          <div className="mb-3 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {createError}
          </div>
        )}
        {createSuccess && (
          <div className="mb-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded">
            {createSuccess}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Name
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
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
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, role: e.target.value }))
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create"}
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
              placeholder="Search by name or email…"
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
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
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
              Loading users…
            </div>
          ) : (
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2 text-slate-600">
                        {u.email}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          value={u.role}
                          onChange={(e) =>
                            handleChangeRole(u._id, e.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleDelete(u._id, u.email)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
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

export default UserManagementPanel;
