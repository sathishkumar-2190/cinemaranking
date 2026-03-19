// ─────────────────────────────────────────────
//  AuthPage — Login + Signup on one page
//  Toggle between login and signup
// ─────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GOLD = "#F5C518";

function AuthPage() {
  const [mode,     setMode]     = useState("login"); // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const reset = () => { setError(""); setMessage(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields"); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match"); return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setMessage("Account created! Please check your email to confirm, then log in.");
        setMode("login");
        setPassword("");
        setConfirm("");
        setLoading(false);
      }
    }
  };

  const switchMode = (m) => {
    setMode(m); reset();
    setPassword(""); setConfirm("");
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold" style={{ color: GOLD }}>
              CinemaRanking
            </h1>
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">

          {/* TOGGLE TABS */}
          <div className="flex bg-neutral-900 rounded-xl p-1 mb-8">
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition"
                style={mode === m
                  ? { backgroundColor: GOLD, color: "#000" }
                  : { color: "#888" }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="bg-green-900/40 border border-green-700 text-green-300 text-sm px-4 py-3 rounded-xl mb-6">
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-neutral-700 text-white px-4 py-3 rounded-xl border border-neutral-600 focus:border-yellow-400 outline-none text-sm transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-neutral-700 text-white px-4 py-3 rounded-xl border border-neutral-600 focus:border-yellow-400 outline-none text-sm transition"
              />
            </div>

            {/* CONFIRM PASSWORD (signup only) */}
            {mode === "signup" && (
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-neutral-700 text-white px-4 py-3 rounded-xl border border-neutral-600 focus:border-yellow-400 outline-none text-sm transition"
                />
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-black text-sm transition hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ backgroundColor: GOLD }}
            >
              {loading
                ? "Please wait..."
                : mode === "login" ? "Log In" : "Create Account"}
            </button>

          </form>

          {/* FORGOT PASSWORD */}
          {mode === "login" && (
            <p className="text-center text-xs text-gray-500 mt-4">
              <button
                onClick={async () => {
                  if (!email) { setError("Enter your email above first"); return; }
                  const { supabase } = await import("../lib/supabase");
                  await supabase.auth.resetPasswordForEmail(email);
                  setMessage("Password reset email sent! Check your inbox.");
                }}
                className="hover:text-yellow-400 transition"
              >
                Forgot password?
              </button>
            </p>
          )}

        </div>

        {/* BACK TO HOME */}
        <p className="text-center text-xs text-gray-500 mt-6">
          <Link to="/" className="hover:text-yellow-400 transition">
            ← Back to home
          </Link>
        </p>

      </div>
    </div>
  );
}

export default AuthPage;