import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../middleware/auth.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict("An account with that email already exists.");

  const user = await User.create({ name, email, password, phone, location });
  const token = signToken(user);

  res.status(201).json({ success: true, token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw ApiError.badRequest("Invalid email or password.");

  if (user.status === "suspended") throw ApiError.forbidden("This account has been suspended.");

  const validPassword = await user.comparePassword(password);
  if (!validPassword) throw ApiError.badRequest("Invalid email or password.");

  const token = signToken(user);
  res.json({ success: true, token, user });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "location", "bio", "avatarUrl"];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({ success: true, user: req.user });
});
