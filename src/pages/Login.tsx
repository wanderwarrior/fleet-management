import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { Eye, EyeOff } from "lucide-react";
import { getUserProfile } from "../services/userApproval";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Forgot Password ─────────────────────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(credential.user.uid);

      if (profile && profile.status === "pending") {
        await auth.signOut();
        setError("Your account is pending admin approval. You'll be notified by email once reviewed.");
        return;
      }
      if (profile && profile.status === "rejected") {
        await auth.signOut();
        setError("Your account registration has been rejected. Please contact support.");
        return;
      }

      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetError("");
    setResetMsg("");
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Password reset email sent. Please check your inbox.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      setResetError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to Fleet Manager</p>
        </div>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 px-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setResetEmail(email);
                  setResetMsg("");
                  setResetError("");
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </form>

      {/* ── Forgot Password Modal ──────────────────────────── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleResetPassword}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm mx-4 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Reset Password</h2>
            <p className="text-sm text-gray-400">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {resetMsg && (
              <p className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                {resetMsg}
              </p>
            )}
            {resetError && (
              <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
                {resetError}
              </p>
            )}

            {!resetMsg && (
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            )}

            <div className="flex items-center gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                {resetMsg ? "Close" : "Cancel"}
              </button>
              {!resetMsg && (
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
