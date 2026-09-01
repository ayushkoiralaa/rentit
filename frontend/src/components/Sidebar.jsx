import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold"
        : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100 hover:translate-x-1"
    }`;

  return (
    <aside className="relative w-60 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/60 min-h-screen p-5 flex flex-col gap-7 overflow-hidden select-none">
      
      {/* 1. Ambient Background Glow Orbs */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl" />
      <div className="pointer-events-none absolute bottom-20 -right-16 w-40 h-40 bg-indigo-600/10 rounded-full blur-2xl" />

      {/* 2. Top Brand Header */}
      <div className="relative z-10 flex items-center gap-3 px-2 pt-1 pb-2 border-b border-zinc-900/80">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-600/30">
          R
        </div>
        <span className="font-serif italic font-bold text-lg text-white tracking-wide">
          RentIt
        </span>
      </div>

      {/* 3. Marketplace Section */}
      <div className="relative z-10">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
          Marketplace
        </span>
        <nav className="mt-2.5 space-y-1.5">
          <NavLink to="/" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">🏠</span>
                <span>Home</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/browse" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">🔍</span>
                <span>Browse listings</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* 4. Manage Section */}
      <div className="relative z-10">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
          Manage
        </span>
        <nav className="mt-2.5 space-y-1.5">
          <NavLink to="/dashboard" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">📊</span>
                <span>Dashboard</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/listings" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">📋</span>
                <span>My Listings</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/listings/new" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">➕</span>
                <span>Add Listing</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/requests" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">📥</span>
                <span>Rental Requests</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/rentals" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">🗝️</span>
                <span>My Rentals</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* 5. You Section */}
      <div className="relative z-10">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
          You
        </span>
        <nav className="mt-2.5 space-y-1.5">
          <NavLink to="/dashboard/favorites" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">❤️</span>
                <span>Favorites</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/messages" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">💬</span>
                <span>Messages</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/notifications" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">🔔</span>
                <span>Notifications</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            {({ isActive }) => (
              <>
                <span className="transition-transform duration-200 group-hover:scale-125">👤</span>
                <span>Profile</span>
                {isActive && <span className="absolute right-1 w-1.5 h-4 bg-white/80 rounded-full shadow-sm" />}
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}