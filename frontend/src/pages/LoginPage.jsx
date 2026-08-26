import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { TextField, PrimaryButton, PageLoader } from "../components/ui.jsx";

// Single combined Login / Sign up page.
// Nothing else in the app is reachable until the user has logged in or
// created an account here (enforced by RequireAuth on every other route).
export default function LoginPage() {
  const { user, loading: authLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Decide which tab to show from the URL (/login vs /register). This is
  // re-evaluated on every navigation (not just on first mount) because
  // React Router reuses this component instance when moving between two
  // sibling routes that render the same element, so a plain useState
  // initializer would keep showing the old tab after e.g. clicking the
  // header's "Sign up" link while already on /login.
  const [mode, setMode] = useState(() => (location.pathname.startsWith("/register") ? "signup" : "login"));

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(location.pathname.startsWith("/register") ? "signup" : "login");
  }, [location.pathname]);

  useEffect(() => {
    setError("");
  }, [mode]);

  if (authLoading) return <PageLoader />;
  if (user) return <Navigate to={location.state?.from || "/"} replace />;

  const switchMode = (next) => {
    setMode(next);
    // Keep the URL in sync without a full navigation/remount.
    navigate(next === "signup" ? "/register" : "/login", { state: location.state, replace: true });
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success("Welcome back!");
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(signupForm);
      toast.success("Account created — welcome to Rent It!");
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-2xl mb-1 text-center">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-sm text-muted text-center mb-7">
        {mode === "login" ? "Log in to manage your rentals and listings." : "Start renting or listing in minutes."}
      </p>

      {/* Tab switcher between Log in / Sign up */}
      <div className="grid grid-cols-2 bg-surface border border-line rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`text-sm font-semibold py-2 rounded-lg transition-colors ${
            mode === "login" ? "bg-white shadow-sm text-brand" : "text-muted hover:text-ink"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`text-sm font-semibold py-2 rounded-lg transition-colors ${
            mode === "signup" ? "bg-white shadow-sm text-brand" : "text-muted hover:text-ink"
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6">
        {error && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {mode === "login" ? (
          <form onSubmit={submitLogin}>
            <TextField
              label="Email"
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <PrimaryButton type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Logging in..." : "Log in"}
            </PrimaryButton>
          </form>
        ) : (
          <form onSubmit={submitSignup}>
            <TextField
              label="Full name"
              required
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              required
              minLength={6}
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Phone (optional)"
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
              />
              <TextField
                label="City (optional)"
                value={signupForm.location}
                onChange={(e) => setSignupForm({ ...signupForm, location: e.target.value })}
              />
            </div>
            <PrimaryButton type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Creating account..." : "Create account"}
            </PrimaryButton>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-muted mt-5">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button type="button" onClick={() => switchMode("signup")} className="text-brand font-semibold">
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => switchMode("login")} className="text-brand font-semibold">
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
