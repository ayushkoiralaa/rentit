import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import slugify from "slugify";
import Item from "../models/Item.js";
import Category from "../models/Category.js";
import Booking, { ACTIVE_HOLD_STATUSES } from "../models/Booking.js";
import Favorite from "../models/Favorite.js";
import { ApiError } from "../utils/ApiError.js";

// Every listing needs *some* category doc to populate/filter on, but we no
// longer force the poster to pick one from the fixed tree. This resolves,
// in order: an existing category id -> a typed custom name (reusing it if
// someone already made that category, otherwise creating it) -> a shared
// "General" fallback category that's created once and reused after that.
async function resolveCategory({ category, newCategory }, user) {
  if (category && mongoose.isValidObjectId(category)) {
    const existing = await Category.findById(category);
    if (existing) return existing;
  }

  const typedName = (newCategory || "").trim();
  if (typedName) {
    const slug = slugify(typedName, { lower: true, strict: true }).slice(0, 60);
    let cat = await Category.findOne({ slug });
    if (!cat) {
      cat = await Category.create({ name: typedName, slug, icon: "Tag", createdBy: user._id });
    }
    return cat;
  }

  let general = await Category.findOne({ slug: "general" });
  if (!general) {
    general = await Category.create({ name: "General", slug: "general", icon: "Tag" });
  }
  return general;
}

// Normalizes tags coming from either a comma-separated string (plain
// <input>) or an array (JSON body / repeated form fields) into a clean,
// de-duplicated array capped at a sane size.
function normalizeTags(tags) {
  const raw = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",") : [];
  const cleaned = raw
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);
  return cleaned.slice(0, 15);
}

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
// sorting, city-level analytics, and database-side pagination.
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
    tag,
    sort = "recommended",
  } = req.query;

  const pageNum = Math.max(1, Number(req.query.page) || 1);
  const limitNum = Math.min(60, Math.max(1, Number(req.query.limit) || 12));

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

  // Case-insensitive City match (anchored string match)
  if (city) {
    filter.city = new RegExp(`^${city.trim()}$`, "i");
  }

  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }
  if (minRating) filter.ratingAverage = { $gte: Number(minRating) };
  if (tag) filter.tags = tag.toLowerCase().trim();
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


  // Aggregate City Statistics if a city query parameter is present
  const cityStatsPromise = city
    ? Item.aggregate([
        {
          $match: {
            status: "PUBLISHED",
            city: new RegExp(`^${city.trim()}$`, "i"),
          },
        },
        {
          $group: {
            _id: null,
            cityName: { $first: "$city" },
            totalItems: { $sum: 1 },
            minPrice: { $min: "$pricePerDay" },
            maxPrice: { $max: "$pricePerDay" },
            avgPrice: { $avg: "$pricePerDay" },
          },
        },
      ])
    : Promise.resolve([]);

  const [items, total, statsResult] = await Promise.all([
    Item.find(filter)
      .sort(sortSpec)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("owner", "name avatarUrl ratingAverage ratingCount")
      .lean(),
    Item.countDocuments(filter),
    cityStatsPromise,
  ]);

  let cityStats = null;
  if (statsResult.length > 0) {
    cityStats = {
      cityName: statsResult[0].cityName,
      totalItems: statsResult[0].totalItems,
      minPrice: statsResult[0].minPrice,
      maxPrice: statsResult[0].maxPrice,
      avgPrice: Math.round(statsResult[0].avgPrice || 0),
    };
  }

  res.json({
    success: true,
    cityStats,
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
    newCategory,
    tags,
    pricePerDay,
    securityDeposit,
    condition,
    location,
    city,
    rules,
    attributes,
    status,
  } = req.body;

  const categoryDoc = await resolveCategory({ category, newCategory }, req.user);

  const images = (req.files || []).map((f) => ({
    url: `/uploads/${f.filename}`,
    publicId: f.filename,
  }));

  const item = await Item.create({
    owner: req.user._id,
    category: categoryDoc._id,
    title,
    slug: await uniqueSlug(title),
    description,
    pricePerDay,
    securityDeposit: securityDeposit || 0,
    condition: condition || "GOOD",
    location,
    city,
    rules: Array.isArray(rules) ? rules : rules ? [rules] : [],
    tags: normalizeTags(tags),
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
  if (req.body.category !== undefined || req.body.newCategory !== undefined) {
    const categoryDoc = await resolveCategory(
      { category: req.body.category, newCategory: req.body.newCategory },
      req.user
    );
    item.category = categoryDoc._id;
  }
  if (req.body.tags !== undefined) item.tags = normalizeTags(req.body.tags);
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