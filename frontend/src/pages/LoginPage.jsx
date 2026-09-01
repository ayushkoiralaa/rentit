import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { TextField, PrimaryButton, PageLoader } from "../components/ui.jsx";

export default function LoginPage() {
  const { user, loading: authLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

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
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-950/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-slate-900/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6 text-center">
          <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-1">
            RENT IT PLATFORM
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "login" ? "Log in to manage your rentals and listings." : "Start renting or listing in minutes."}
          </p>
          <div className="w-12 h-1 bg-blue-700 rounded-full mt-4" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-950 border border-slate-800 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`text-sm font-semibold py-2 rounded-lg transition-all ${
              mode === "login" ? "bg-blue-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`text-sm font-semibold py-2 rounded-lg transition-all ${
              mode === "signup" ? "bg-blue-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div>
          {mode === "login" ? (
            <form onSubmit={submitLogin} className="space-y-4 text-slate-200">
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
              <PrimaryButton type="submit" disabled={loading} className="w-full mt-2 bg-blue-900 hover:bg-blue-800 text-white rounded-full py-3">
                {loading ? "Logging in..." : "Log in"}
              </PrimaryButton>
            </form>
          ) : (
            <form onSubmit={submitSignup} className="space-y-4 text-slate-200">
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
              <PrimaryButton type="submit" disabled={loading} className="w-full mt-2 bg-blue-900 hover:bg-blue-800 text-white rounded-full py-3">
                {loading ? "Creating account..." : "Create account"}
              </PrimaryButton>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-6 pt-4 border-t border-slate-800/80">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button type="button" onClick={() => switchMode("signup")} className="text-blue-400 font-semibold hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")} className="text-blue-400 font-semibold hover:underline">
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}