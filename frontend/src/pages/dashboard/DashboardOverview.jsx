import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List, CalendarCheck2, Inbox, Heart, Plus } from "lucide-react";
import { itemsApi } from "../../api/items.js";
import { bookingsApi, favoritesApi } from "../../api/marketplace.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageLoader, ErrorState, PrimaryButton } from "../../components/ui.jsx";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    Promise.all([
      itemsApi.browse({ owner: user._id, limit: 1, status: "PUBLISHED" }),
      bookingsApi.mine({ role: "owner", status: "PENDING" }),
      bookingsApi.mine({ role: "renter" }),
      favoritesApi.list(),
    ])
      .then(([listings, requests, rentals, favorites]) => {
        setStats({
          listings: listings.pagination.total,
          pendingRequests: requests.bookings.length,
          activeRentals: rentals.bookings.filter((b) => ["PENDING", "ACCEPTED", "ACTIVE"].includes(b.status)).length,
          favorites: favorites.favorites.length,
        });
      })
      .catch((err) => setError(err.message || "Couldn't load your dashboard."));
  };

  useEffect(load, [user._id]);

  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!stats) return <PageLoader />;

  const cards = [
    ["My Listings", stats.listings, List, "/dashboard/listings", "text-brand"],
    ["Pending Requests", stats.pendingRequests, Inbox, "/dashboard/requests", "text-amber-600"],
    ["Active/Pending Rentals", stats.activeRentals, CalendarCheck2, "/dashboard/rentals", "text-success"],
    ["Favorites", stats.favorites, Heart, "/dashboard/favorites", "text-danger"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted">Here's what's happening with your account.</p>
        </div>
        <Link to="/dashboard/listings/new">
          <PrimaryButton type="button" className="flex items-center gap-1.5"><Plus size={15} /> List an item</PrimaryButton>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(([label, value, Icon, to, color]) => (
          <Link key={label} to={to} className="bg-white border border-line rounded-2xl p-4 hover:shadow-card transition-shadow">
            <Icon size={18} className={color} />
            <p className="text-2xl font-bold mt-2">{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
