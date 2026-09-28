import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import EduvaLogo from "../components/EduvaLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3fbf6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#c9ebd6] space-y-5">
        <div className="text-center flex flex-col items-center pb-1">
          <EduvaLogo className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-black text-[#253D2C]">Forgot Password</h1>
          <p className="text-xs text-[#477e57] mt-0.5">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-2">
            {/* Success state */}
            <div className="w-16 h-16 mx-auto bg-[#CFFFDC] rounded-full flex items-center justify-center text-3xl">
              📬
            </div>
            <div>
              <p className="font-bold text-[#253D2C] text-base">Check your inbox!</p>
              <p className="text-sm text-[#477e57] mt-1 leading-relaxed">
                If <span className="font-semibold text-[#2E6F40]">{email}</span> is registered,
                a reset link has been sent. Check your spam folder too.
              </p>
            </div>
            <p className="text-xs text-[#68BA7F]">The link expires in 1 hour.</p>
            <Link
              to="/login"
              className="inline-block text-sm text-[#2E6F40] font-bold hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <div>
              <label className="text-xs font-bold text-[#477e57] block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#c9ebd6] rounded-xl p-3 focus:ring-2 focus:ring-[#68BA7F] focus:border-[#2E6F40] outline-none text-[#253D2C]"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#2E6F40] hover:bg-[#253D2C] text-white py-3 rounded-xl font-bold transition shadow-xs disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <p className="text-sm text-[#477e57] text-center">
              Remember it?{" "}
              <Link to="/login" className="text-[#2E6F40] font-bold hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
