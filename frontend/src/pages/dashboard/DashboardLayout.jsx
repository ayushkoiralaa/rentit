import React from "react";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="w-full bg-slate-950 text-slate-100 p-8 min-h-screen">
      <Outlet />
    </div>
  );
}