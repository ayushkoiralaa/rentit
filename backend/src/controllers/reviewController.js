import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { notify } from "../utils/notify.js";

// Recompute the running average without re-scanning every review, by
// folding the new rating into the stored count/average.
//
// This uses a MongoDB aggregation-pipeline update, which — unlike a
// find(), mutate-in-JS, then save() — is a single atomic operation on the
// document. Two reviews landing at nearly the same instant can no longer
// each read the same starting count/average and overwrite one another;
// each update is computed server-side from whatever the current value is
// at the moment it runs.
async function bumpRating(Model, id, rating) {
  await Model.updateOne({ _id: id }, [
    {
      $set: {
        ratingAverage: {
          $round: [
            {
              $divide: [
                { $add: [{ $multiply: ["$ratingAverage", "$ratingCount"] }, rating] },
                { $add: ["$ratingCount", 1] },
              ],
            },
            1,
          ],
        },
        ratingCount: { $add: ["$ratingCount", 1] },
      },
    },
  ]);
}

// POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId).populate("item");
  if (!booking) throw ApiError.notFound("Booking not found.");
  if (String(booking.renter) !== String(req.user._id)) {
    throw ApiError.forbidden("Only the renter can review this rental.");
  }
  if (booking.status !== "COMPLETED") {
    throw ApiError.badRequest("You can only review a rental after it's completed.");
  }

  const existing = await Review.findOne({ booking: booking._id, reviewer: req.user._id });
  if (existing) throw ApiError.conflict("You already reviewed this rental.");

  const review = await Review.create({
    booking: booking._id,
    item: booking.item._id,
    reviewer: req.user._id,
    reviewee: booking.owner,
    rating,
    comment,
  });

  await bumpRating(Item, booking.item._id, rating);
  await bumpRating(User, booking.owner, rating);

  await notify(booking.owner, {
    type: "REVIEW_RECEIVED",
    title: "You got a new review",
    message: `${req.user.name} left a ${rating}-star review on "${booking.item.title}".`,
    link: `/items/${booking.item.slug}`,
  });

  res.status(201).json({ success: true, review });
});

// GET /api/reviews/item/:itemId
export const getItemReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ item: req.params.itemId })
    .sort({ createdAt: -1 })
    .populate("reviewer", "name avatarUrl");
  res.json({ success: true, reviews });
});
