import { Router } from "express";
import { body } from "express-validator";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listCategories);

// Any logged-in user can create a category (e.g. while posting an item and
// typing one that doesn't exist yet) — not just admins. Editing/removing
// the tree stays admin-only, see below.
router.post(
  "/",
  requireAuth,
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  validate,
  createCategory
);
router.patch("/:id", requireAuth, requireAdmin, updateCategory);
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);

export default router;
