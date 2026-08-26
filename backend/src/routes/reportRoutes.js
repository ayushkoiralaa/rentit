import { Router } from "express";
import { body } from "express-validator";
import { createReport } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  [
    body("reason")
      .isIn(["SCAM", "FAKE_LISTING", "INCORRECT_INFORMATION", "INAPPROPRIATE_CONTENT", "UNSAFE_BEHAVIOR", "OTHER"])
      .withMessage("Select a valid reason."),
    body("description").optional().isLength({ max: 1000 }),
  ],
  validate,
  createReport
);

export default router;
