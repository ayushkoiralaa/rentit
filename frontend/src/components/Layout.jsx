import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <div className="flex-1 flex items-start w-full">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
