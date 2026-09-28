import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-[#477e57] uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="bg-white border border-[#c9ebd6] rounded-2xl overflow-hidden divide-y divide-[#e3f5eb] shadow-xs">
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
          <p className="text-sm font-bold text-[#253D2C]">{label}</p>
          {hint && <p className="text-xs text-[#477e57] mt-0.5">{hint}</p>}
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl z-50 transition ${
        type === "success"
          ? "bg-[#2E6F40] text-white border border-[#68BA7F]"
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

  // ── Forgot password (from settings) ─────────────────────
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: user.email });
      setResetSent(true);
      showToast("✅ Password reset link sent to your email!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send reset link", "error");
    } finally {
      setResetLoading(false);
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
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <div className="pt-2">
        <h2 className="text-2xl font-black text-[#253D2C]">Account Settings</h2>
        <p className="text-sm text-[#477e57] mt-0.5">
          Manage your student profile, credentials, and account
        </p>
      </div>

      {/* ── Account Info ──────────────────────────────────── */}
      <Section title="Profile Information">
        <FieldRow
          label="Display Name"
          hint="This name appears on badges, streaks, and summaries"
        >
          <form onSubmit={handleUpdateName} className="flex gap-2 mt-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border border-[#c9ebd6] bg-[#f8fdfa] text-[#253D2C] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
              placeholder="Your name"
              required
            />
            <button
              type="submit"
              disabled={nameLoading || name.trim() === user?.name}
              className="px-4 py-2 bg-[#2E6F40] hover:bg-[#253D2C] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </form>
        </FieldRow>

        <FieldRow label="Email Address" hint="Linked login email (read-only)">
          <div className="flex items-center gap-2 mt-1">
            <input
              value={user?.email || ""}
              readOnly
              className="flex-1 border border-[#c9ebd6] bg-[#e3f5eb]/60 text-[#376344] rounded-xl px-3 py-2 text-sm cursor-not-allowed font-medium"
            />
            <span className="text-xs text-[#68BA7F] font-semibold whitespace-nowrap">Read-only</span>
          </div>
        </FieldRow>
      </Section>

      {/* ── Change Password ───────────────────────────────── */}
      <Section title="Security & Password">
        <FieldRow
          label="Change Password"
          hint="Update your security password (minimum 6 characters)"
        >
          <form onSubmit={handleUpdatePassword} className="space-y-3 mt-1">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full border border-[#c9ebd6] bg-[#f8fdfa] text-[#253D2C] rounded-xl px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-2.5 text-[#68BA7F] hover:text-[#253D2C] text-sm"
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
              className="w-full border border-[#c9ebd6] bg-[#f8fdfa] text-[#253D2C] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40]"
              required
            />

            <input
              type={showPw ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full border rounded-xl px-3 py-2 text-sm bg-[#f8fdfa] text-[#253D2C] focus:outline-none focus:ring-2 focus:ring-[#68BA7F] ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-400"
                  : "border-[#c9ebd6] focus:border-[#2E6F40]"
              }`}
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-600 font-semibold">Passwords do not match</p>
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
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          n <= strength
                            ? strength >= 4
                              ? "bg-[#2E6F40]"
                              : strength >= 3
                              ? "bg-[#68BA7F]"
                              : "bg-amber-400"
                            : "bg-[#e3f5eb]"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-[#477e57] font-medium">
                  Strength:{" "}
                  {newPassword.length >= 12
                    ? "Very Strong 💪"
                    : newPassword.length >= 8
                    ? "Good"
                    : newPassword.length >= 6
                    ? "Acceptable"
                    : "Too short"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-[#2E6F40] hover:bg-[#253D2C] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </FieldRow>

        <FieldRow
          label="Forgot Password / Reset via Email"
          hint={`Send a secure password reset link to ${user?.email || "your registered email"}`}
        >
          <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#f8fdfa] border border-[#c9ebd6] p-3.5 rounded-xl">
            <p className="text-xs text-[#477e57] leading-relaxed">
              {resetSent ? (
                <span className="text-[#2E6F40] font-semibold">
                  📬 Reset link dispatched! Check your inbox (or spam) at {user?.email}.
                </span>
              ) : (
                "Can't recall your password or registered via Google? Click below to receive a 1-hour password reset link."
              )}
            </p>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={resetLoading}
              className="flex-shrink-0 px-4 py-2 border border-[#2E6F40] bg-[#f4fbf6] hover:bg-[#CFFFDC]/60 text-[#2E6F40] disabled:opacity-50 text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap"
            >
              {resetLoading ? "Sending Link…" : resetSent ? "Resend Link" : "Send Reset Link"}
            </button>
          </div>
        </FieldRow>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
          Danger Zone
        </h3>
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-red-800">Delete Account</p>
              <p className="text-xs text-red-700/80 mt-0.5 leading-relaxed">
                Permanently deletes your study history, streaks, earned badges, and goals. This action cannot be reversed.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteZone((p) => !p)}
              className="flex-shrink-0 px-3.5 py-1.5 border border-red-300 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition"
            >
              {showDeleteZone ? "Cancel" : "Delete"}
            </button>
          </div>

          {showDeleteZone && (
            <div className="mt-4 space-y-3 border-t border-red-200 pt-4">
              <p className="text-xs text-red-700 font-semibold">
                Type your username <span className="font-black underline">{user?.name}</span> to confirm:
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={user?.name}
                className="w-full border border-red-300 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user?.name}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-xs"
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
