import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Layout() {
  const toast = useToast();

  useEffect(() => {
    const onSessionExpired = () => toast.info("Your session expired. Please log in again.");
    window.addEventListener("auth:session-expired", onSessionExpired);
    return () => window.removeEventListener("auth:session-expired", onSessionExpired);
  }, [toast]);

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
