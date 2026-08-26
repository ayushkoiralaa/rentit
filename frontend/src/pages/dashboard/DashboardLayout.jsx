import React from "react";
import { Outlet } from "react-router-dom";

// Dashboard navigation now lives in the site-wide left Sidebar (see
// components/Sidebar.jsx), so this layout only needs to provide the
// content column and spacing for dashboard pages.
export default function DashboardLayout() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Outlet />
    </div>
  );
}
