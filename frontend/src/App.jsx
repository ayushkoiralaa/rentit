import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import { Help, About, Terms, Privacy, ProhibitedItems } from "./pages/StaticPages.jsx";

import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.jsx";
import MyListings from "./pages/dashboard/MyListings.jsx";
import ListingForm from "./pages/dashboard/ListingForm.jsx";
import RentalRequests from "./pages/dashboard/RentalRequests.jsx";
import MyRentals from "./pages/dashboard/MyRentals.jsx";
import Messages from "./pages/dashboard/Messages.jsx";
import { Favorites, Notifications, Profile } from "./pages/dashboard/MiscPages.jsx";

import {
  AdminLayout, AdminOverview, AdminUsers, AdminListings, AdminBookings, AdminReports, AdminAuditLogs,
} from "./pages/admin/AdminPages.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public: a single combined Login/Sign up page is the only thing
          reachable without an account. It uses its own minimal layout —
          no search bar, no site nav, no footer — just the logo and the
          login/signup card. /register renders the same page, pre-selected
          on the Sign up tab. */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<LoginPage />} />
      </Route>

      <Route element={<Layout />}>
        {/* Everything else requires being logged in */}
        <Route element={<RequireAuth><Outlet /></RequireAuth>}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="items/:idOrSlug" element={<ItemDetail />} />
          <Route path="help" element={<Help />} />
          <Route path="about" element={<About />} />
          <Route path="legal/terms" element={<Terms />} />
          <Route path="legal/privacy" element={<Privacy />} />
          <Route path="legal/prohibited-items" element={<ProhibitedItems />} />

          <Route path="profile" element={<Profile />} />

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

          <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
