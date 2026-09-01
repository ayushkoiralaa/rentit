import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3 flex items-center justify-between shadow-xl shadow-black/40 select-none">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-600/30 group-hover:scale-105 group-hover:shadow-blue-500/50 transition-all duration-300">
          R
        </div>
        <span className="text-2xl font-extrabold text-white font-serif italic tracking-tight group-hover:text-blue-400 transition-colors">
          Rent<span className="text-blue-400">It</span>
        </span>
      </Link>

      {/* Animated Search Bar Form */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative group">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tools, gadgets, vehicles..."
            className="w-full bg-slate-900/80 hover:bg-slate-900 border border-slate-800 focus:border-blue-500/80 rounded-full py-2 pl-10 pr-8 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-inner"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 text-xs transition-colors duration-200">
            🔍
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Right Navigation */}
      <div className="flex items-center gap-6 text-xs font-semibold">
        <Link
          to="/browse"
          className="text-slate-300 hover:text-white hover:translate-y-[-1px] transition-all duration-200"
        >
          Browse
        </Link>
        <Link
          to="/help"
          className="text-slate-300 hover:text-white hover:translate-y-[-1px] transition-all duration-200"
        >
          How it works
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/listings/new"
              className="group relative inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span className="inline-block group-hover:rotate-90 transition-transform duration-300">+</span>
              <span>List an item</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-slate-400 hover:text-rose-400 text-xs transition-colors duration-200"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white px-2 transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Join us
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}