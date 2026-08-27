import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Menu, X, User, LayoutDashboard, Heart, LogOut, Shield, Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { SidebarContent } from "./Sidebar.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : "/browse");
    setMobileOpen(false);
  };

  const handleListItem = () => {
    if (!user) return navigate("/login", { state: { from: "/dashboard/listings/new" } });
    navigate("/dashboard/listings/new");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="font-display font-bold text-xl shrink-0" aria-label="Rent It home">
            <span className="text-ink">Rent</span>
            <span className="text-brand">It</span>
          </Link>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex items-center w-full bg-surface border border-line rounded-xl px-3 focus-within:ring-2 focus-within:ring-brand/40">
              <Search size={16} className="text-muted shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tools, gadgets, vehicles..."
                className="w-full bg-transparent border-none outline-none text-sm px-2 py-2.5"
                aria-label="Search listings"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-5">
            <Link to="/browse" className="text-sm font-medium text-ink hover:text-brand">
              Browse
            </Link>
            <Link to="/#how-it-works" className="text-sm font-medium text-ink hover:text-brand">
              How it works
            </Link>
            <button
              onClick={handleListItem}
              className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus size={15} /> List an item
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard/notifications" className="relative text-ink hover:text-brand" aria-label="Notifications">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-brand-soft text-brand font-semibold flex items-center justify-center text-sm"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-line rounded-xl shadow-card-hover py-1.5 text-sm">
                      <div className="px-3.5 py-2 border-b border-line">
                        <p className="font-semibold text-ink truncate">{user.name}</p>
                        <p className="text-muted text-xs truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-surface">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link to="/dashboard/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-surface">
                        <Heart size={15} /> Favorites
                      </Link>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-surface">
                        <User size={15} /> Profile
                      </Link>
                      {user.role === "admin" && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-surface">
                          <Shield size={15} /> Admin panel
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-surface text-danger border-t border-line mt-1"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium px-3 py-2 text-ink hover:text-brand">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-semibold px-4 py-2.5 rounded-lg border border-line hover:border-brand hover:text-brand">
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          <button className="md:hidden text-ink" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line px-4 py-4 space-y-3 bg-white">
          <form onSubmit={submitSearch} className="flex items-center bg-surface border border-line rounded-xl px-3">
            <Search size={16} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full bg-transparent border-none outline-none text-sm px-2 py-2.5"
            />
          </form>
          <button onClick={() => { handleListItem(); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
            <Plus size={15} /> List an item
          </button>
          {user ? (
            <>
              <div className="border-t border-line pt-2 -mx-1">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </div>
              <button onClick={() => { logout(); setMobileOpen(false); navigate("/"); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-danger border-t border-line">
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-medium py-2.5 border border-line rounded-lg">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-semibold py-2.5 bg-brand text-white rounded-lg">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
