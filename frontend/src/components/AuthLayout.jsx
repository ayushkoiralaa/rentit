import React from "react";
import { Link, Outlet } from "react-router-dom";

// Deliberately minimal: no search bar, no browse/nav links, no footer.
// This page's only job is to get someone logged in or signed up — nothing
// else on the site should be visible or reachable from here.
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link to="/" className="font-display font-bold text-xl" aria-label="Rent It home">
            <span className="text-ink">Rent</span>
            <span className="text-brand">It</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
