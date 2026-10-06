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

  const handleGithubClick = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      setError(
        "GitHub Client ID is not configured yet. Please add VITE_GITHUB_CLIENT_ID in client/.env"
      );
      return;
    }
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user,user:email`;
    window.location.href = githubAuthUrl;
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

        {/* Social Logins: Google & GitHub */}
        <div className="flex flex-col gap-2.5">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center py-2.5 border border-[#c9ebd6] rounded-xl text-xs text-[#477e57] font-medium bg-[#f3fbf6]">
              Signing in with Google…
            </div>
          ) : (
            <div className="w-full [&>div]:w-full [&>div>div]:w-full [&>div>div>iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in was cancelled or failed")}
                theme="outline"
                size="large"
                width={400}
                text="signin_with"
                shape="rectangular"
              />
            </div>
          )}

          {/* GitHub Sign-In */}
          <button
            type="button"
            onClick={handleGithubClick}
            disabled={loading || googleLoading}
            className="w-full h-[40px] flex items-center justify-center gap-2.5 bg-[#24292F] hover:bg-[#1B1F23] text-white rounded-md text-sm font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>Continue with GitHub</span>
          </button>
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
