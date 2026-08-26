import asyncHandler from "express-async-handler";
import Favorite from "../models/Favorite.js";
import Item from "../models/Item.js";
import { ApiError } from "../utils/ApiError.js";

export const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "item",
      populate: [{ path: "category", select: "name slug" }, { path: "owner", select: "name" }],
    });

  res.json({ success: true, favorites: favorites.filter((f) => f.item) });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.itemId);
  if (!item) throw ApiError.notFound("Listing not found.");

  const existing = await Favorite.findOne({ user: req.user._id, item: item._id });
  if (existing) return res.json({ success: true, message: "Already favorited." });

  await Favorite.create({ user: req.user._id, item: item._id });
  item.favoriteCount += 1;
  await item.save();

  res.status(201).json({ success: true, message: "Added to favorites." });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const deleted = await Favorite.findOneAndDelete({ user: req.user._id, item: req.params.itemId });
  if (deleted) {
    await Item.findByIdAndUpdate(req.params.itemId, { $inc: { favoriteCount: -1 } });
  }
  res.json({ success: true, message: "Removed from favorites." });
});
