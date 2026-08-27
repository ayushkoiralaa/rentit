import { Router } from "express";
import { body } from "express-validator";
import {
  browseItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  addItemImages,
  removeItemImage,
  checkAvailability,
  getBookedRanges,
} from "../controllers/itemController.js";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadItemImages } from "../middleware/upload.js";

const router = Router();

const itemValidators = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 120 }),
  body("description").trim().notEmpty().withMessage("Description is required.").isLength({ max: 3000 }),
  // Category is optional — pick an existing one, type a new one in
  // "newCategory", or leave both blank and it lands in "General".
  body("category").optional({ checkFalsy: true }).isString(),
  body("newCategory").optional({ checkFalsy: true }).isString().isLength({ max: 60 }),
  body("pricePerDay").isFloat({ min: 1 }).withMessage("Price per day must be greater than 0."),
  body("securityDeposit").optional().isFloat({ min: 0 }),
  body("location").trim().notEmpty().withMessage("Location is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
];

router.get("/", attachUserIfPresent, browseItems);
router.get("/:idOrSlug", attachUserIfPresent, getItem);
router.get("/:id/availability", checkAvailability);
router.get("/:id/booked-ranges", getBookedRanges);

router.post("/", requireAuth, uploadItemImages, itemValidators, validate, createItem);
router.patch("/:id", requireAuth, updateItem);
router.delete("/:id", requireAuth, deleteItem);

router.post("/:id/images", requireAuth, uploadItemImages, addItemImages);
router.delete("/:id/images/:imageId", requireAuth, removeItemImage);

export default router;
