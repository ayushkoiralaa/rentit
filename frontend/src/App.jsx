import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import HowItWorks from "./pages/dashboard/HowItWorks.jsx";
import { About, Terms, Privacy, ProhibitedItems } from "./pages/StaticPages.jsx";

import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.jsx";
import MyListings from "./pages/dashboard/MyListings.jsx";
import ListingForm from "./pages/dashboard/ListingForm.jsx";
import RentalRequests from "./pages/dashboard/RentalRequests.jsx";
import MyRentals from "./pages/dashboard/MyRentals.jsx";
import Messages from "./pages/dashboard/Messages.jsx";
import { Favorites, Notifications, Profile } from "./pages/dashboard/MiscPages.jsx";

import {
  AdminLayout,
  AdminOverview,
  AdminUsers,
  AdminListings,
  AdminBookings,
  AdminReports,
  AdminAuditLogs,
} from "./pages/admin/AdminPages.jsx";

export default function App() {
  return (
    <Routes>
      {/* Unprotected Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage initialMode="login" />} />
        <Route path="register" element={<LoginPage initialMode="signup" />} />
      </Route>

      {/* Main Application Routes (Requires Authentication) */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="items/:idOrSlug" element={<ItemDetail />} />
          <Route path="help" element={<HowItWorks />} />
          <Route path="about" element={<About />} />
          <Route path="legal/terms" element={<Terms />} />
          <Route path="legal/privacy" element={<Privacy />} />
          <Route path="legal/prohibited-items" element={<ProhibitedItems />} />

          <Route path="profile" element={<Profile />} />

          {/* User Dashboard */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="listings/new" element={<ListingForm />} />
            <Route path="listings/:id/edit" element={<ListingForm />} />
            <Route path="requests" element={<RentalRequests />} />
            <Route path="rentals" element={<MyRentals />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Admin Section (Requires Admin privileges) */}
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}