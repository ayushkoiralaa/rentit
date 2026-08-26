import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe, updateMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadAvatar } from "../middleware/upload.js";
import asyncHandler from "express-async-handler";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 80 }),
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  ],
  validate,
  register
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  login
);

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);

router.post(
  "/me/avatar",
  requireAuth,
  uploadAvatar,
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    req.user.avatarUrl = `/uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ success: true, user: req.user });
  })
);

export default router;
