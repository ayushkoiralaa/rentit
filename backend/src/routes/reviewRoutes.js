import { Router } from "express";
import { body } from "express-validator";
import { createReview, getItemReviews } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/item/:itemId", getItemReviews);

router.post(
  "/",
  requireAuth,
  [
    body("bookingId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("comment").optional().isLength({ max: 1000 }),
  ],
  validate,
  createReview
);

export default router;
