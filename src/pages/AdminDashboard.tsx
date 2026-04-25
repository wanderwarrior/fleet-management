import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, LogOut, Shield, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { subscribeToUserProfiles, updateUserStatus } from "../services/userApproval";
import type { UserProfile } from "../services/userApproval";

type MenuTab = "users";

function StatusBadge({ status }: { status: UserProfile["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
        <CheckCircle className="h-3 w-3" /> Active
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400">
        <XCircle className="h-3 w-3" /> Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab] = useState<MenuTab>("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = subscribeToUserProfiles(
      (data) => { setUsers(data); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, []);

  async function handleToggleStatus(user: UserProfile) {
    const newStatus = user.status === "approved" ? "rejected" : "approved";
    setUpdating(user.uid);
    try {
      await updateUserStatus(user.uid, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, status: newStatus } : u))
      );
    } finally {
      setUpdating(null);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminSession");
    navigate("/admin");
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "approved").length,
    pending: users.filter((u) => u.status === "pending").length,
    inactive: users.filter((u) => u.status === "rejected").length,
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-800">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Fleet Admin</p>
            <p className="text-xs text-gray-500">Management Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 text-sm font-medium transition-colors"
          >
            <Users className="h-4 w-4" />
            Users
          </button>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800 shrink-0">
          <h1 className="text-lg font-semibold text-white">
            {activeTab === "users" ? "User Management" : ""}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Live"}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: counts.total, color: "text-white" },
              { label: "Active", value: counts.active, color: "text-emerald-400" },
              { label: "Pending", value: counts.pending, color: "text-amber-400" },
              { label: "Inactive", value: counts.inactive, color: "text-rose-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            {/* Table header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Registered Users</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <XCircle className="h-8 w-8 text-rose-500" />
                <p className="text-sm text-rose-400">Failed to load users</p>
                <p className="text-xs text-gray-500">{error}</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="h-6 w-6 text-gray-600 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Users className="h-10 w-10 text-gray-700" />
                <p className="text-sm text-gray-500">
                  {search ? "No users match your search." : "No users registered yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">User</th>
                      <th className="text-left px-5 py-3 font-medium">Email</th>
                      <th className="text-left px-5 py-3 font-medium">Registered</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filtered.map((user) => (
                      <tr key={user.uid} className="hover:bg-gray-800/50 transition-colors">
                        {/* Avatar + Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-blue-400">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-white">{user.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5 text-gray-400">{user.email}</td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={user.status} />
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5">
                          {user.status === "approved" ? (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={updating === user.uid}
                              className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user.uid ? "Updating…" : "Deactivate"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={updating === user.uid}
                              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user.uid ? "Updating…" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
