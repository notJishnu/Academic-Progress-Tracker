import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/api";
import EduvaLogo from "../components/EduvaLogo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3fbf6] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#c9ebd6] space-y-4">
        <div className="text-center pb-2 flex flex-col items-center">
          <EduvaLogo className="w-12 h-12 mb-2 shadow-xs" />
          <h1 className="text-2xl font-black text-[#253D2C]">Welcome to Eduva 👋</h1>
          <p className="text-xs text-[#477e57] mt-0.5">Track your academic goals & daily study streaks</p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>
        )}

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
          <label className="text-xs font-bold text-[#477e57] block mb-1">Password</label>
          <input
            type="password" required placeholder="••••••••"
            className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white py-3 rounded-xl font-bold transition shadow-xs disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login to Eduva"}
        </button>

        <p className="text-sm text-[#477e57] text-center pt-2">
          Don't have an account? <Link to="/register" className="text-[#2E6F40] font-bold hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
