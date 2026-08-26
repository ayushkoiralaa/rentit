import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import slugify from "slugify";
import Item from "../models/Item.js";
import Category from "../models/Category.js";
import Booking, { ACTIVE_HOLD_STATUSES } from "../models/Booking.js";
import Favorite from "../models/Favorite.js";
import { ApiError } from "../utils/ApiError.js";

async function uniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 80) || "item";
  let slug = base;
  let n = 1;
  // Guard against title collisions without ever creating duplicate slugs.
  while (await Item.exists({ slug })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

// GET /api/items — public marketplace browse with filtering, search,
// sorting and database-side pagination. Never loads the whole table.
export const browseItems = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    city,
    minPrice,
    maxPrice,
    condition,
    minRating,
    startDate,
    endDate,
    owner,
    status,
    sort = "recommended",
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  // Public visitors only ever see published listings. Admins may pass any
  // explicit status. Owners looking at their own listings (owner === the
  // logged-in user) may also see all their own statuses, since that's
  // exactly what "My Listings" needs to render drafts/paused/rejected items.
  const isViewingOwnListings = owner && req.user && String(owner) === String(req.user._id);
  if (req.user?.role === "admin" && status) {
    filter.status = status;
  } else if (isViewingOwnListings) {
    if (status) filter.status = status;
    // else: no status filter — show every status for the owner's own listings
  } else {
    filter.status = "PUBLISHED";
  }

  if (owner) filter.owner = owner;
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) {
      const children = await Category.find({ parent: cat._id }).select("_id");
      const ids = [cat._id, ...children.map((c) => c._id)];
      filter.category = { $in: ids };
    } else if (mongoose.isValidObjectId(category)) {
      filter.category = category;
    }
  }
  if (city) filter.city = new RegExp(`^${city}$`, "i");
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }
  if (minRating) filter.ratingAverage = { $gte: Number(minRating) };
  if (q) filter.$text = { $search: q };

  let itemIdsToExclude = null;
  if (startDate && endDate) {
    const overlapping = await Booking.find({
      status: { $in: ACTIVE_HOLD_STATUSES },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    }).select("item");
    itemIdsToExclude = overlapping.map((b) => b.item);
  }
  if (itemIdsToExclude) filter._id = { $nin: itemIdsToExclude };

  const sortMap = {
    recommended: { favoriteCount: -1, ratingAverage: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    price_asc: { pricePerDay: 1 },
    price_desc: { pricePerDay: -1 },
    rating: { ratingAverage: -1 },
  };
  const sortSpec = sortMap[sort] || sortMap.recommended;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(60, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort(sortSpec)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("owner", "name avatarUrl ratingAverage ratingCount")
      .lean(),
    Item.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
});

// GET /api/items/:idOrSlug
export const getItem = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

  const item = await Item.findOne(query)
    .populate("category", "name slug")
    .populate("owner", "name avatarUrl location ratingAverage ratingCount createdAt");

  if (!item) throw ApiError.notFound("Listing not found.");

  // Don't leak unpublished listings to strangers.
  const isOwner = req.user && String(item.owner._id) === String(req.user._id);
  const isAdmin = req.user?.role === "admin";
  if (item.status !== "PUBLISHED" && !isOwner && !isAdmin) {
    throw ApiError.notFound("Listing not found.");
  }

  if (!isOwner) {
    item.viewCount += 1;
    await item.save();
  }

  let isFavorited = false;
  if (req.user) {
    isFavorited = !!(await Favorite.exists({ user: req.user._id, item: item._id }));
  }

  res.json({ success: true, item, isFavorited });
});

// POST /api/items — create listing (images handled separately or inline)
export const createItem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    pricePerDay,
    securityDeposit,
    condition,
    location,
    city,
    rules,
    attributes,
    status,
  } = req.body;

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw ApiError.badRequest("Select a valid category.");

  const images = (req.files || []).map((f) => ({
    url: `/uploads/${f.filename}`,
    publicId: f.filename,
  }));

  const item = await Item.create({
    owner: req.user._id,
    category,
    title,
    slug: await uniqueSlug(title),
    description,
    pricePerDay,
    securityDeposit: securityDeposit || 0,
    condition: condition || "GOOD",
    location,
    city,
    rules: Array.isArray(rules) ? rules : rules ? [rules] : [],
    attributes: attributes ? new Map(Object.entries(attributes)) : undefined,
    images,
    status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
  });

  res.status(201).json({ success: true, item });
});

async function getOwnedItemOrThrow(itemId, user) {
  const item = await Item.findById(itemId);
  if (!item) throw ApiError.notFound("Listing not found.");
  if (String(item.owner) !== String(user._id) && user.role !== "admin") {
    throw ApiError.forbidden("You can only manage your own listings.");
  }
  return item;
}

// PATCH /api/items/:id
export const updateItem = asyncHandler(async (req, res) => {
  const item = await getOwnedItemOrThrow(req.params.id, req.user);

  const editable = [
    "title",
    "description",
    "category",
    "pricePerDay",
    "securityDeposit",
    "condition",
    "location",
    "city",
    "rules",
    "status",
  ];
  for (const field of editable) {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  }
  if (req.body.title) item.slug = await uniqueSlug(req.body.title);
  if (req.body.attributes) item.attributes = new Map(Object.entries(req.body.attributes));

  // Owners can only choose DRAFT/PUBLISHED/PAUSED themselves; admin
  // moderation states are set through the admin routes instead.
  if (req.body.status && req.user.role !== "admin") {
    if (!["DRAFT", "PUBLISHED", "PAUSED"].includes(req.body.status)) {
      throw ApiError.forbidden("You cannot set that listing status.");
    }
  }

  await item.save();
  res.json({ success: true, item });
});

// POST /api/items/:id/images — append images to an existing listing
export const addItemImages = asyncHandler(async (req, res) => {
  const item = await getOwnedItemOrThrow(req.params.id, req.user);

  const incoming = (req.files || []).map((f) => ({ url: `/uploads/${f.filename}`, publicId: f.filename }));
  if (item.images.length + incoming.length > 8) {
    throw ApiError.badRequest("A listing can have a maximum of 8 images.");
  }
  item.images.push(...incoming);
  await item.save();
  res.status(201).json({ success: true, item });
});

// DELETE /api/items/:id/images/:imageId
export const removeItemImage = asyncHandler(async (req, res) => {
  const item = await getOwnedItemOrThrow(req.params.id, req.user);
  item.images = item.images.filter((img) => String(img._id) !== req.params.imageId);
  await item.save();
  res.json({ success: true, item });
});

// DELETE /api/items/:id
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await getOwnedItemOrThrow(req.params.id, req.user);

  const activeBooking = await Booking.exists({
    item: item._id,
    status: { $in: ACTIVE_HOLD_STATUSES },
  });
  if (activeBooking) {
    throw ApiError.badRequest("This listing has active or pending bookings and cannot be deleted.");
  }

  await item.deleteOne();
  res.json({ success: true, message: "Listing removed." });
});

// GET /api/items/:id/availability?startDate=&endDate=
export const checkAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) throw ApiError.badRequest("startDate and endDate are required.");

  const overlap = await Booking.exists({
    item: req.params.id,
    status: { $in: ACTIVE_HOLD_STATUSES },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  });

  res.json({ success: true, available: !overlap });
});

// GET /api/items/:id/booked-ranges — for rendering a calendar of taken dates
export const getBookedRanges = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    item: req.params.id,
    status: { $in: ACTIVE_HOLD_STATUSES },
  }).select("startDate endDate status -_id");

  res.json({ success: true, ranges: bookings });
});
