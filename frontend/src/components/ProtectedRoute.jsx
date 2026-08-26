import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageLoader } from "./ui.jsx";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/register" state={{ from: location.pathname }} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
