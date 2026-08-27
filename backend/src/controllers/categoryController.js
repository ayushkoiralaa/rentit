import asyncHandler from "express-async-handler";
import slugify from "slugify";
import Category from "../models/Category.js";
import Item from "../models/Item.js";
import { ApiError } from "../utils/ApiError.js";

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  // Build a parent -> children tree so the frontend can render a
  // Daraz-style nested category menu without extra requests.
  const byId = new Map(categories.map((c) => [String(c._id), { ...c, children: [] }]));
  const tree = [];
  for (const cat of byId.values()) {
    if (cat.parent) {
      const parent = byId.get(String(cat.parent));
      if (parent) parent.children.push(cat);
    } else {
      tree.push(cat);
    }
  }

  res.json({ success: true, categories: tree, flat: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, parent } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Category.findOne({ slug });
  if (exists) throw ApiError.conflict("A category with that name already exists.");

  // Regular (non-admin) users can only create top-level categories of their
  // own — nesting under an existing branch stays an admin-only action so
  // the built-in tree doesn't get cluttered by everyone.
  const isAdmin = req.user?.role === "admin";
  const category = await Category.create({
    name,
    slug,
    icon: icon || "Tag",
    parent: isAdmin ? parent || null : null,
    createdBy: isAdmin ? null : req.user._id,
  });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found.");

  const { name, icon, parent } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });
  }
  if (icon !== undefined) category.icon = icon;
  if (parent !== undefined) category.parent = parent || null;

  await category.save();
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found.");

  const [childCount, itemCount] = await Promise.all([
    Category.countDocuments({ parent: category._id }),
    Item.countDocuments({ category: category._id }),
  ]);
  if (childCount > 0) throw ApiError.badRequest("Remove or reassign subcategories first.");
  if (itemCount > 0) throw ApiError.badRequest("This category still has listings attached to it.");

  await category.deleteOne();
  res.json({ success: true, message: "Category deleted." });
});
