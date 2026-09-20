import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="px-5 py-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
          {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50 transition ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {msg}
    </div>
  );
}

export default function SettingsPanel() {
  const { user, refreshUser, logout } = useAuth();

  // ── Name update ──────────────────────────────────────────
  const [name, setName] = useState(user?.name || "");
  const [nameLoading, setNameLoading] = useState(false);

  // ── Password update ──────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // ── Delete account ───────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  // ── Toast ────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    try {
      await api.patch("/auth/update-profile", { name: name.trim() });
      await refreshUser();
      showToast("✅ Name updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update name", "error");
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords don't match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    setPwLoading(true);
    try {
      await api.patch("/auth/update-profile", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("✅ Password updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.name) return;
    try {
      await api.delete("/auth/delete-account");
      logout();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account", "error");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div className="pt-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* ── Account Info ──────────────────────────────────── */}
      <Section title="Account">
        <FieldRow
          label="Display Name"
          hint="This name appears across the app"
        >
          <form onSubmit={handleUpdateName} className="flex gap-2 mt-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name"
              required
            />
            <button
              type="submit"
              disabled={nameLoading || name.trim() === user?.name}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition"
            >
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </form>
        </FieldRow>

        <FieldRow label="Email" hint="Email cannot be changed">
          <div className="flex items-center gap-2 mt-1">
            <input
              value={user?.email || ""}
              readOnly
              className="flex-1 border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-xl px-3 py-2 text-sm cursor-not-allowed"
            />
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">Read-only</span>
          </div>
        </FieldRow>
      </Section>

      {/* ── Change Password ───────────────────────────────── */}
      <Section title="Change Password">
        <FieldRow
          label="Update your password"
          hint="Must be at least 6 characters"
        >
          <form onSubmit={handleUpdatePassword} className="space-y-2.5 mt-1">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm"
                tabIndex={-1}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            <input
              type={showPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type={showPw ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full border rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-400 dark:border-red-500"
                  : "border-slate-200 dark:border-slate-600"
              }`}
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}

            {/* Strength indicator */}
            {newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => {
                    const strength =
                      newPassword.length >= 12
                        ? 4
                        : newPassword.length >= 8
                        ? 3
                        : newPassword.length >= 6
                        ? 2
                        : 1;
                    return (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          n <= strength
                            ? strength >= 4
                              ? "bg-emerald-500"
                              : strength >= 3
                              ? "bg-yellow-500"
                              : "bg-orange-400"
                            : "bg-slate-200 dark:bg-slate-600"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Strength:{" "}
                  {newPassword.length >= 12
                    ? "Strong 💪"
                    : newPassword.length >= 8
                    ? "Good"
                    : newPassword.length >= 6
                    ? "Weak"
                    : "Too short"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition"
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </FieldRow>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">
          Danger Zone
        </h3>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-red-500 dark:text-red-500/80 mt-0.5">
                Permanently deletes all your goals, streaks, badges, and data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteZone((p) => !p)}
              className="flex-shrink-0 px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition"
            >
              {showDeleteZone ? "Cancel" : "Delete"}
            </button>
          </div>

          {showDeleteZone && (
            <div className="mt-4 space-y-3 border-t border-red-200 dark:border-red-800/40 pt-4">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Type your name <span className="font-bold">{user?.name}</span> to confirm:
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={user?.name}
                className="w-full border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user?.name}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition"
              >
                ⚠️ Permanently Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
