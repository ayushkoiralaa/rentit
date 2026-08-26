import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Search,
  LayoutGrid,
  List,
  PlusCircle,
  Inbox as InboxIcon,
  CalendarCheck2,
  Heart,
  MessageSquare,
  Bell,
  User,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_SECTIONS = [
  {
    label: "Marketplace",
    links: [
      { to: "/", label: "Home", icon: Home, end: true },
      { to: "/browse", label: "Browse listings", icon: Search },
    ],
  },
  {
    label: "Manage",
    links: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
      { to: "/dashboard/listings", label: "My Listings", icon: List },
      { to: "/dashboard/listings/new", label: "Add Listing", icon: PlusCircle },
      { to: "/dashboard/requests", label: "Rental Requests", icon: InboxIcon },
      { to: "/dashboard/rentals", label: "My Rentals", icon: CalendarCheck2 },
    ],
  },
  {
    label: "You",
    links: [
      { to: "/dashboard/favorites", label: "Favorites", icon: Heart },
      { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
      { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { to: "/profile", label: "Profile", icon: User },
    ],
  },
];

function SidebarLink({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={!!end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? "bg-brand-soft text-brand" : "text-ink hover:bg-surface"
        }`
      }
    >
      <Icon size={16} /> {label}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted mb-1.5">
            {section.label}
          </p>
          <nav className="space-y-0.5">
            {section.links.map((link) => (
              <SidebarLink key={link.to} {...link} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>
      ))}

      {user.role === "admin" && (
        <div className="mb-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted mb-1.5">Admin</p>
          <nav>
            <SidebarLink to="/admin" label="Admin panel" icon={Shield} onNavigate={onNavigate} />
          </nav>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-line bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-5 px-3">
      <SidebarContent />
    </aside>
  );
}
