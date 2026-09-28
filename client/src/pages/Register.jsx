import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/api";
import EduvaLogo from "../components/EduvaLogo";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
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
      setError(getApiErrorMessage(err, "Google sign-up failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3fbf6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#c9ebd6] space-y-4">
        <div className="text-center pb-2 flex flex-col items-center">
          <EduvaLogo className="w-12 h-12 mb-2 shadow-xs" />
          <h1 className="text-2xl font-black text-[#253D2C]">Join Eduva 🚀</h1>
          <p className="text-xs text-[#477e57] mt-0.5">Build daily study discipline and earn milestone badges</p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>
        )}

        {/* Google Sign-Up */}
        <div className="flex flex-col items-center">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center py-3 border-2 border-[#c9ebd6] rounded-xl text-sm text-[#477e57] font-medium">
              Signing up with Google…
            </div>
          ) : (
            <div className="w-full [&>div]:w-full [&>div>div]:w-full [&>div>div>iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-up was cancelled or failed")}
                theme="outline"
                size="large"
                width={400}
                text="signup_with"
                shape="rectangular"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#c9ebd6]" />
          <span className="text-xs text-[#68BA7F] font-medium">or register with email</span>
          <div className="flex-1 h-px bg-[#c9ebd6]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#477e57] block mb-1">Full Name</label>
            <input
              type="text" required placeholder="Alex Johnson"
              className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#477e57] block mb-1">Email</label>
            <input
              type="email" required placeholder="alex@university.edu"
              className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#477e57] block mb-1">Password</label>
            <input
              type="password" required placeholder="At least 6 characters"
              className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading || googleLoading}
            className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white py-3 rounded-xl font-bold transition shadow-xs disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Join Eduva"}
          </button>
        </form>

        <p className="text-sm text-[#477e57] text-center pt-1">
          Already have an account? <Link to="/login" className="text-[#2E6F40] font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
