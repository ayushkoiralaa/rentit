import {
  Sofa, Camera, Wrench, Bike, Shirt, Tag, Dumbbell, PartyPopper, MoreHorizontal,
} from "lucide-react";

export const CATEGORY_ICONS = {
  Sofa, Camera, Wrench, Bike, Shirt, Tag, Dumbbell, PartyPopper,
};

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] || MoreHorizontal;
}

export const CONDITION_LABELS = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
};

export const BOOKING_STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export const BOOKING_STATUS_COLORS = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED: "bg-blue-50 text-brand border-blue-200",
  ACTIVE: "bg-emerald-50 text-success border-emerald-200",
  COMPLETED: "bg-gray-100 text-ink border-gray-200",
  REJECTED: "bg-red-50 text-danger border-red-200",
  CANCELLED: "bg-red-50 text-danger border-red-200",
  DISPUTED: "bg-orange-50 text-orange-700 border-orange-200",
};

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return "Rs. " + n.toLocaleString("en-IN");
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
