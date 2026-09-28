import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import EduvaLogo from "../components/EduvaLogo";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength =
    password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0;
  const strengthLabel = ["", "Too short", "Acceptable", "Good", "Very Strong 💪"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-[#68BA7F]", "bg-[#2E6F40]"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords don't match");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      // Backend returns auth data (user + token) on success — log them in directly
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem("token", data.token);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3fbf6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#c9ebd6] space-y-5">
        <div className="text-center flex flex-col items-center pb-1">
          <EduvaLogo className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-black text-[#253D2C]">Set New Password</h1>
          <p className="text-xs text-[#477e57] mt-0.5">Choose a strong password for your account</p>
        </div>

        {success ? (
          <div className="text-center space-y-3 py-2">
            <div className="w-16 h-16 mx-auto bg-[#CFFFDC] rounded-full flex items-center justify-center text-3xl">
              ✅
            </div>
            <p className="font-bold text-[#253D2C]">Password updated!</p>
            <p className="text-sm text-[#477e57]">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            {/* New password */}
            <div>
              <label className="text-xs font-bold text-[#477e57] block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#c9ebd6] rounded-xl p-3 pr-10 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-3 text-[#68BA7F] hover:text-[#253D2C] text-sm"
                  tabIndex={-1}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-all ${n <= strength ? strengthColor : "bg-[#e3f5eb]"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#477e57] font-medium">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs font-bold text-[#477e57] block mb-1">Confirm Password</label>
              <input
                type={showPw ? "text" : "password"}
                required
                placeholder="Repeat new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] outline-none text-[#253D2C] ${
                  confirm && confirm !== password ? "border-red-400" : "border-[#c9ebd6] focus:border-[#2E6F40]"
                }`}
              />
              {confirm && confirm !== password && (
                <p className="text-xs text-red-600 font-semibold mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              disabled={loading || !password || !confirm}
              className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white py-3 rounded-xl font-bold transition shadow-xs disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>

            <p className="text-sm text-[#477e57] text-center">
              <Link to="/login" className="text-[#2E6F40] font-bold hover:underline">
                ← Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
