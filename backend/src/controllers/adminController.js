import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Booking from "../models/Booking.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";
import AuditLog from "../models/AuditLog.js";
import { ApiError } from "../utils/ApiError.js";
import { notify } from "../utils/notify.js";

async function logAction(req, action, targetType, targetId, metadata = {}) {
  await AuditLog.create({ actor: req.user._id, action, targetType, targetId, metadata });
}

// GET /api/admin/analytics
export const getAnalytics = asyncHandler(async (_req, res) => {
  const [totalUsers, totalListings, totalBookings, activeRentals, completedRentals, revenueAgg, topCategories] =
    await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "ACTIVE" }),
      Booking.countDocuments({ status: "COMPLETED" }),
      Booking.aggregate([
        { $match: { status: { $in: ["ACTIVE", "COMPLETED"] } } },
        { $group: { _id: null, revenue: { $sum: "$platformFee" }, avgBooking: { $avg: "$totalAmount" } } },
      ]),
      Item.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
        { $unwind: "$category" },
        { $project: { name: "$category.name", count: 1, _id: 0 } },
      ]),
    ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalListings,
      totalBookings,
      activeRentals,
      completedRentals,
      platformRevenue: revenueAgg[0]?.revenue || 0,
      averageBookingValue: Math.round(revenueAgg[0]?.avgBooking || 0),
      topCategories,
    },
  });
});

// GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { q, status, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
  if (status) filter.status = status;
  if (role) filter.role = role;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, pagination: { page: pageNum, limit: limitNum, total } });
});

// PATCH /api/admin/users/:id/status
export const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found.");
  if (String(user._id) === String(req.user._id)) throw ApiError.badRequest("You cannot suspend yourself.");

  user.status = status;
  await user.save();
  await logAction(req, "SET_USER_STATUS", "User", user._id, { status });

  res.json({ success: true, user });
});

// GET /api/admin/listings
export const listAllItems = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("owner", "name email")
      .populate("category", "name"),
    Item.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page: pageNum, limit: limitNum, total } });
});

// PATCH /api/admin/listings/:id/moderate  { status, rejectionReason }
export const moderateItem = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const item = await Item.findById(req.params.id);
  if (!item) throw ApiError.notFound("Listing not found.");

  item.status = status;
  item.rejectionReason = status === "REJECTED" ? rejectionReason || "" : "";
  await item.save();
  await logAction(req, "MODERATE_LISTING", "Item", item._id, { status });

  await notify(item.owner, {
    type: "LISTING_STATUS_CHANGED",
    title: "Your listing status changed",
    message: `"${item.title}" is now ${status.replace("_", " ").toLowerCase()}.`,
    link: `/dashboard/listings`,
  });

  res.json({ success: true, item });
});

// GET /api/admin/bookings
export const listAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("item", "title slug")
      .populate("renter", "name email")
      .populate("owner", "name email"),
    Booking.countDocuments(filter),
  ]);

  res.json({ success: true, bookings, pagination: { page: pageNum, limit: limitNum, total } });
});

// GET /api/admin/reports
export const listReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .populate("reporter", "name email")
    .populate("reportedUser", "name email")
    .populate("item", "title slug");
  res.json({ success: true, reports });
});

// PATCH /api/admin/reports/:id  { status }
export const updateReportStatus = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw ApiError.notFound("Report not found.");

  report.status = req.body.status;
  await report.save();
  await logAction(req, "UPDATE_REPORT", "Report", report._id, { status: report.status });

  res.json({ success: true, report });
});

// DELETE /api/admin/reviews/:id — moderate abusive reviews
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound("Review not found.");
  await review.deleteOne();
  await logAction(req, "DELETE_REVIEW", "Review", req.params.id);
  res.json({ success: true, message: "Review removed." });
});

// GET /api/admin/audit-logs
export const listAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).populate("actor", "name email");
  res.json({ success: true, logs });
});
