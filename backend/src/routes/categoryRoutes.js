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

router.post(
  "/",
  requireAuth,
  requireAdmin,
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  validate,
  createCategory
);
router.patch("/:id", requireAuth, requireAdmin, updateCategory);
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);

export default router;
