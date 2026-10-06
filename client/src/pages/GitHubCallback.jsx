import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/api";
import EduvaLogo from "../components/EduvaLogo";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGithub } = useAuth();

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const [status, setStatus] = useState(
    error || !code ? "error" : "processing"
  );
  const [errorMessage, setErrorMessage] = useState(
    error
      ? errorDescription || error || "GitHub authentication was declined or cancelled."
      : !code
      ? "No authorization code received from GitHub."
      : ""
  );
  const hasCalled = useRef(false);

  useEffect(() => {
    // Guard against React 18/19 StrictMode double-invoking useEffect
    if (!code || error || hasCalled.current) return;
    hasCalled.current = true;

    loginWithGithub(code)
      .then(() => {
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          getApiErrorMessage(
            err,
            "Failed to complete GitHub sign-in. The authorization code may have expired."
          )
        );
      });
  }, [code, error, loginWithGithub, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3fbf6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#c9ebd6] text-center space-y-5">
        <div className="flex flex-col items-center">
          <EduvaLogo className="w-12 h-12 mb-3 shadow-xs" />
          <h1 className="text-xl font-black text-[#253D2C]">
            GitHub Authentication
          </h1>
        </div>

        {status === "processing" ? (
          <div className="py-6 space-y-4 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-[#2E6F40] animate-spin" />
            <div>
              <p className="text-sm font-bold text-[#253D2C]">
                Signing you into Eduva…
              </p>
              <p className="text-xs text-[#477e57] mt-1">
                Connecting your GitHub profile and issuing secure credentials.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold leading-relaxed">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 mb-0.5">Authentication Failed</p>
                <p>{errorMessage}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/login"
                className="flex-1 flex items-center justify-center gap-2 bg-[#2E6F40] hover:bg-[#253D2C] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
