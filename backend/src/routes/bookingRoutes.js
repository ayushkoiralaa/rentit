import { Router } from "express";
import { body } from "express-validator";
import {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  activateBooking,
  completeBooking,
  getMyBookings,
  simulatePayment,
} from "../controllers/bookingController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);

router.get("/mine", getMyBookings);

router.post(
  "/",
  [
    body("itemId").notEmpty().withMessage("itemId is required."),
    body("startDate").isISO8601().withMessage("Provide a valid start date."),
    body("endDate").isISO8601().withMessage("Provide a valid end date."),
  ],
  validate,
  createBooking
);

router.patch("/:id/accept", acceptBooking);
router.patch("/:id/reject", rejectBooking);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/activate", activateBooking);
router.patch("/:id/complete", completeBooking);
router.post("/:id/pay", simulatePayment);

export default router;
