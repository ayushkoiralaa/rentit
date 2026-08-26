import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Booking, { ACTIVE_HOLD_STATUSES, VALID_TRANSITIONS } from "../models/Booking.js";
import Item from "../models/Item.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateBookingPrice, calculateRentalDays } from "../utils/pricing.js";
import { notify } from "../utils/notify.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function hasOverlap(itemId, startDate, endDate, session) {
  const overlap = await Booking.findOne({
    item: itemId,
    status: { $in: ACTIVE_HOLD_STATUSES },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  }).session(session ?? null);
  return !!overlap;
}

// POST /api/bookings — request a rental.
// Availability is a critical marketplace subsystem: the frontend calendar
// is a UX layer only. Every rule here is re-enforced server-side, and we
// re-check immediately before writing to close the race window.
export const createBooking = asyncHandler(async (req, res) => {
  const { itemId, startDate: rawStart, endDate: rawEnd } = req.body;

  const item = await Item.findById(itemId);
  if (!item) throw ApiError.notFound("Listing not found.");
  if (item.status !== "PUBLISHED") throw ApiError.badRequest("This listing isn't available for booking.");

  if (String(item.owner) === String(req.user._id)) {
    throw ApiError.badRequest("You cannot rent your own listing.");
  }

  const startDate = startOfDay(rawStart);
  const endDate = startOfDay(rawEnd);
  const today = startOfDay(new Date());

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw ApiError.badRequest("Provide valid start and end dates.");
  }
  if (startDate < today) throw ApiError.badRequest("Start date cannot be in the past.");
  if (endDate <= startDate) throw ApiError.badRequest("End date must be after the start date.");

  const pricing = calculateBookingPrice({
    pricePerDay: item.pricePerDay,
    startDate,
    endDate,
    securityDeposit: item.securityDeposit,
  });

  // Prefer an ACID transaction (works when MongoDB runs as a replica set,
  // e.g. Atlas). Standalone local MongoDB doesn't support transactions,
  // so we gracefully fall back to a tight recheck-then-insert instead of
  // crashing local development.
  const session = await mongoose.startSession();
  let booking;
  let usedTransaction = true;
  try {
    await session.withTransaction(async () => {
      if (await hasOverlap(item._id, startDate, endDate, session)) {
        throw ApiError.conflict("Those dates were just booked by someone else. Try different dates.");
      }
      const created = await Booking.create(
        [
          {
            item: item._id,
            renter: req.user._id,
            owner: item.owner,
            startDate,
            endDate,
            numberOfDays: pricing.numberOfDays,
            rentalAmount: pricing.rentalAmount,
            platformFee: pricing.platformFee,
            securityDeposit: pricing.securityDeposit,
            totalAmount: pricing.totalAmount,
            currency: pricing.currency,
          },
        ],
        { session }
      );
      booking = created[0];
    });
  } catch (err) {
    if (err?.errorLabelSet?.has || String(err.message).includes("Transaction numbers")) {
      usedTransaction = false;
    } else {
      await session.endSession();
      throw err;
    }
  }
  await session.endSession();

  if (!usedTransaction) {
    // Fallback path for standalone MongoDB without replica-set support.
    if (await hasOverlap(item._id, startDate, endDate)) {
      throw ApiError.conflict("Those dates were just booked by someone else. Try different dates.");
    }
    booking = await Booking.create({
      item: item._id,
      renter: req.user._id,
      owner: item.owner,
      startDate,
      endDate,
      numberOfDays: pricing.numberOfDays,
      rentalAmount: pricing.rentalAmount,
      platformFee: pricing.platformFee,
      securityDeposit: pricing.securityDeposit,
      totalAmount: pricing.totalAmount,
      currency: pricing.currency,
    });
  }

  await notify(item.owner, {
    type: "BOOKING_REQUEST_RECEIVED",
    title: "New rental request",
    message: `${req.user.name} wants to rent "${item.title}".`,
    link: `/dashboard/requests`,
  });

  res.status(201).json({ success: true, booking });
});

async function loadBookingForParticipant(bookingId, user) {
  const booking = await Booking.findById(bookingId).populate("item");
  if (!booking) throw ApiError.notFound("Booking not found.");

  const isRenter = String(booking.renter) === String(user._id);
  const isOwner = String(booking.owner) === String(user._id);
  const isAdmin = user.role === "admin";
  if (!isRenter && !isOwner && !isAdmin) throw ApiError.forbidden("This booking doesn't belong to you.");

  return { booking, isRenter, isOwner, isAdmin };
}

function assertTransition(current, next) {
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw ApiError.badRequest(`Cannot move a booking from ${current} to ${next}.`);
  }
}

// PATCH /api/bookings/:id/accept — owner only
export const acceptBooking = asyncHandler(async (req, res) => {
  const { booking, isOwner, isAdmin } = await loadBookingForParticipant(req.params.id, req.user);
  if (!isOwner && !isAdmin) throw ApiError.forbidden("Only the owner can accept a request.");
  assertTransition(booking.status, "ACCEPTED");

  booking.status = "ACCEPTED";
  await booking.save();

  await notify(booking.renter, {
    type: "BOOKING_ACCEPTED",
    title: "Rental request accepted",
    message: `Your request for "${booking.item.title}" was accepted.`,
    link: `/dashboard/rentals`,
  });

  res.json({ success: true, booking });
});

// PATCH /api/bookings/:id/reject — owner only
export const rejectBooking = asyncHandler(async (req, res) => {
  const { booking, isOwner, isAdmin } = await loadBookingForParticipant(req.params.id, req.user);
  if (!isOwner && !isAdmin) throw ApiError.forbidden("Only the owner can reject a request.");
  assertTransition(booking.status, "REJECTED");

  booking.status = "REJECTED";
  booking.rejectReason = req.body.reason || "";
  await booking.save();

  await notify(booking.renter, {
    type: "BOOKING_REJECTED",
    title: "Rental request declined",
    message: `Your request for "${booking.item.title}" was declined.`,
    link: `/dashboard/rentals`,
  });

  res.json({ success: true, booking });
});

// PATCH /api/bookings/:id/cancel — renter or owner
export const cancelBooking = asyncHandler(async (req, res) => {
  const { booking, isRenter, isOwner, isAdmin } = await loadBookingForParticipant(req.params.id, req.user);
  if (!isRenter && !isOwner && !isAdmin) throw ApiError.forbidden("You cannot cancel this booking.");
  assertTransition(booking.status, "CANCELLED");

  booking.status = "CANCELLED";
  booking.cancelReason = req.body.reason || "";
  await booking.save();

  const notifyTarget = isRenter ? booking.owner : booking.renter;
  await notify(notifyTarget, {
    type: "BOOKING_CANCELLED",
    title: "Booking cancelled",
    message: `The booking for "${booking.item.title}" was cancelled.`,
    link: `/dashboard/rentals`,
  });

  res.json({ success: true, booking });
});

// PATCH /api/bookings/:id/activate — owner marks item as handed over
export const activateBooking = asyncHandler(async (req, res) => {
  const { booking, isOwner, isAdmin } = await loadBookingForParticipant(req.params.id, req.user);
  if (!isOwner && !isAdmin) throw ApiError.forbidden("Only the owner can start this rental.");
  assertTransition(booking.status, "ACTIVE");

  booking.status = "ACTIVE";
  await booking.save();
  res.json({ success: true, booking });
});

// PATCH /api/bookings/:id/complete — owner marks rental as returned/completed
export const completeBooking = asyncHandler(async (req, res) => {
  const { booking, isOwner, isAdmin } = await loadBookingForParticipant(req.params.id, req.user);
  if (!isOwner && !isAdmin) throw ApiError.forbidden("Only the owner can complete this rental.");
  assertTransition(booking.status, "COMPLETED");

  booking.status = "COMPLETED";
  await booking.save();

  await notify(booking.renter, {
    type: "BOOKING_COMPLETED",
    title: "Rental completed",
    message: `Your rental of "${booking.item.title}" is complete. Leave a review!`,
    link: `/dashboard/rentals`,
  });

  res.json({ success: true, booking });
});

// GET /api/bookings/mine?role=renter|owner
export const getMyBookings = asyncHandler(async (req, res) => {
  const role = req.query.role === "owner" ? "owner" : "renter";
  const filter = role === "owner" ? { owner: req.user._id } : { renter: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .populate("item", "title slug images pricePerDay city")
    .populate("renter", "name avatarUrl")
    .populate("owner", "name avatarUrl");

  res.json({ success: true, bookings });
});

// Simulated DEMO payment provider — behind a stable interface so a real
// gateway can be dropped in later without touching the booking logic.
export const simulatePayment = asyncHandler(async (req, res) => {
  const { booking, isRenter } = await loadBookingForParticipant(req.params.id, req.user);
  if (!isRenter) throw ApiError.forbidden("Only the renter can pay for this booking.");
  if (booking.paymentStatus === "DEMO_PAID") throw ApiError.badRequest("This booking is already paid.");

  booking.paymentStatus = "DEMO_PAID";
  booking.paymentReference = `DEMO-${Date.now()}`;
  await booking.save();

  res.json({
    success: true,
    booking,
    notice: "This is a simulated DEMO payment. No real money was charged, and no deposit is actually held in escrow.",
  });
});

export { calculateRentalDays };
