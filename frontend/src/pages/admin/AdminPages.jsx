import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Users, List, CalendarCheck2, Flag, ScrollText } from "lucide-react";
import { adminApi } from "../../api/marketplace.js";
import { PageLoader, Badge, PrimaryButton, SecondaryButton, DangerButton, EmptyState, ErrorState } from "../../components/ui.jsx";
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "../../constants.js";
import { useToast } from "../../context/ToastContext.jsx";

const links = [
  ["/admin", "Overview", LayoutGrid, true],
  ["/admin/users", "Users", Users],
  ["/admin/listings", "Listings", List],
  ["/admin/bookings", "Bookings", CalendarCheck2],
  ["/admin/reports", "Reports", Flag],
  ["/admin/audit-logs", "Audit Log", ScrollText],
];

export function AdminLayout() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 h-fit">
          <nav className="bg-white border border-line rounded-2xl p-2 flex lg:flex-col overflow-x-auto gap-1">
            {links.map(([to, label, Icon, end]) => (
              <NavLink
                key={to}
                to={to}
                end={!!end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${
                    isActive ? "bg-brand-soft text-brand" : "text-ink hover:bg-surface"
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const [a, setA] = useState(null);
  const [error, setError] = useState(null);
  const load = () => {
    setError(null);
    adminApi.analytics().then((res) => setA(res.analytics)).catch((err) => setError(err.message || "Couldn't load analytics."));
  };
  useEffect(load, []);
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!a) return <PageLoader />;

  const cards = [
    ["Total Users", a.totalUsers],
    ["Total Listings", a.totalListings],
    ["Total Bookings", a.totalBookings],
    ["Active Rentals", a.activeRentals],
    ["Completed Rentals", a.completedRentals],
    ["Platform Revenue", formatCurrency(a.platformRevenue)],
    ["Avg Booking Value", formatCurrency(a.averageBookingValue)],
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Admin Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white border border-line rounded-2xl p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-line rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-3">Top Categories</h3>
        <div className="space-y-2">
          {a.topCategories.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-sm">
              <span>{c.name}</span>
              <span className="font-semibold">{c.count} listings</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const load = () => {
    setError(null);
    adminApi.users({ limit: 50 }).then((res) => setUsers(res.users)).catch((err) => setError(err.message || "Couldn't load users."));
  };
  useEffect(load, []);

  const setStatus = async (u, status) => {
    try {
      await adminApi.setUserStatus(u._id, status);
      toast.success(`User ${status === "suspended" ? "suspended" : "reactivated"}.`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!users) return <PageLoader />;
  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Users</h1>
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {users.map((u) => (
          <div key={u._id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3 border-b border-line last:border-0">
            <div className="w-9 h-9 rounded-full bg-brand-soft text-brand text-xs font-semibold flex items-center justify-center shrink-0">{u.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{u.name} {u.role === "admin" && <Badge className="ml-1 bg-brand-soft text-brand border-brand/20">admin</Badge>}</p>
              <p className="text-xs text-muted truncate">{u.email}</p>
            </div>
            <Badge className={u.status === "active" ? "bg-emerald-50 text-success border-emerald-200" : "bg-red-50 text-danger border-red-200"}>{u.status}</Badge>
            {u.role !== "admin" && (
              u.status === "active" ? (
                <DangerButton onClick={() => setStatus(u, "suspended")} className="py-1.5 px-3 text-xs shrink-0">Suspend</DangerButton>
              ) : (
                <SecondaryButton onClick={() => setStatus(u, "active")} className="py-1.5 px-3 text-xs shrink-0">Reactivate</SecondaryButton>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminListings() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const load = () => {
    setError(null);
    adminApi.listings({ limit: 50 }).then((res) => setItems(res.items)).catch((err) => setError(err.message || "Couldn't load listings."));
  };
  useEffect(load, []);

  const moderate = async (item, status) => {
    let rejectionReason = "";
    if (status === "REJECTED") rejectionReason = prompt("Reason for rejection?") || "";
    try {
      await adminApi.moderateListing(item._id, { status, rejectionReason });
      toast.success("Listing updated.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!items) return <PageLoader />;
  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Listings</h1>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item._id} className="bg-white border border-line rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.title}</p>
              <p className="text-xs text-muted">{item.owner?.name} · {formatCurrency(item.pricePerDay)}/day · {item.status}</p>
            </div>
            {item.status !== "REMOVED" && (
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {item.status !== "PUBLISHED" && <SecondaryButton onClick={() => moderate(item, "PUBLISHED")} className="py-1.5 px-2.5 text-xs">Approve</SecondaryButton>}
                {item.status !== "REJECTED" && <DangerButton onClick={() => moderate(item, "REJECTED")} className="py-1.5 px-2.5 text-xs">Reject</DangerButton>}
                <DangerButton onClick={() => moderate(item, "REMOVED")} className="py-1.5 px-2.5 text-xs">Remove</DangerButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const load = () => {
    setError(null);
    adminApi.bookings({ limit: 50 }).then((res) => setBookings(res.bookings)).catch((err) => setError(err.message || "Couldn't load bookings."));
  };
  useEffect(load, []);
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!bookings) return <PageLoader />;
  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Bookings</h1>
      <div className="space-y-2">
        {bookings.map((b) => (
          <div key={b._id} className="bg-white border border-line rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{b.item?.title}</p>
              <p className="text-xs text-muted">{b.renter?.name} ← {b.owner?.name} · {formatCurrency(b.totalAmount)} · {formatDate(b.startDate)}</p>
            </div>
            <Badge className={`${BOOKING_STATUS_COLORS[b.status]} shrink-0 self-start sm:self-auto`}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReports() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const load = () => {
    setError(null);
    adminApi.reports({}).then((res) => setReports(res.reports)).catch((err) => setError(err.message || "Couldn't load reports."));
  };
  useEffect(load, []);

  const update = async (r, status) => {
    try {
      await adminApi.updateReport(r._id, status);
      toast.success("Report updated.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!reports) return <PageLoader />;
  if (reports.length === 0) return <EmptyState title="No reports" description="Reports from users will appear here." />;
  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Reports</h1>
      <div className="space-y-2">
        {reports.map((r) => (
          <div key={r._id} className="bg-white border border-line rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{r.reason.replace("_", " ")} — {r.item?.title || r.reportedUser?.name}</p>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200">{r.status}</Badge>
            </div>
            {r.description && <p className="text-xs text-muted mt-1">{r.description}</p>}
            <p className="text-xs text-muted mt-1">Reported by {r.reporter?.name}</p>
            {r.status === "OPEN" && (
              <div className="flex gap-2 mt-2">
                <SecondaryButton onClick={() => update(r, "REVIEWING")} className="py-1.5 px-3 text-xs">Reviewing</SecondaryButton>
                <SecondaryButton onClick={() => update(r, "RESOLVED")} className="py-1.5 px-3 text-xs">Resolve</SecondaryButton>
                <SecondaryButton onClick={() => update(r, "DISMISSED")} className="py-1.5 px-3 text-xs">Dismiss</SecondaryButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);
  const load = () => {
    setError(null);
    adminApi.auditLogs().then((res) => setLogs(res.logs)).catch((err) => setError(err.message || "Couldn't load the audit log."));
  };
  useEffect(load, []);
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!logs) return <PageLoader />;
  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Audit Log</h1>
      <div className="space-y-2">
        {logs.map((l) => (
          <div key={l._id} className="bg-white border border-line rounded-xl p-3 text-sm">
            <span className="font-semibold">{l.actor?.name}</span> {l.action.replace(/_/g, " ").toLowerCase()} · <span className="text-xs text-muted">{formatDate(l.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
