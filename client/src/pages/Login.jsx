import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/api";
import EduvaLogo from "../components/EduvaLogo";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle(credential);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Google sign-in failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3fbf6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#c9ebd6] space-y-4">
        <div className="text-center pb-2 flex flex-col items-center">
          <EduvaLogo className="w-12 h-12 mb-2 shadow-xs" />
          <h1 className="text-2xl font-black text-[#253D2C]">Welcome to Eduva 👋</h1>
          <p className="text-xs text-[#477e57] mt-0.5">Track your academic goals &amp; daily study streaks</p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>
        )}

        {/* Google Sign-In */}
        <div className="flex flex-col items-center gap-2">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center py-3 border-2 border-[#c9ebd6] rounded-xl text-sm text-[#477e57] font-medium">
              Signing in with Google…
            </div>
          ) : (
            <div className="w-full [&>div]:w-full [&>div>div]:w-full [&>div>div>iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in was cancelled or failed")}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#c9ebd6]" />
          <span className="text-xs text-[#68BA7F] font-medium">or sign in with email</span>
          <div className="flex-1 h-px bg-[#c9ebd6]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#477e57] block mb-1">Email</label>
            <input
              type="email" required placeholder="student@example.com"
              className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#477e57]">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#2E6F40] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password" required placeholder="••••••••"
              className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading || googleLoading}
            className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white py-3 rounded-xl font-bold transition shadow-xs disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login to Eduva"}
          </button>
        </form>

        <p className="text-sm text-[#477e57] text-center pt-1">
          Don't have an account? <Link to="/register" className="text-[#2E6F40] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
