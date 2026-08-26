import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";

// Verifies the JWT and attaches the (fresh, DB-checked) user to req.user.
// Re-reading the user on every request lets us catch suspended accounts
// immediately instead of trusting a stale token payload.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw ApiError.unauthorized("Access denied. Token missing.");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token.");
  }

  const user = await User.findById(payload.userId);
  if (!user) throw ApiError.unauthorized("Account no longer exists.");
  if (user.status === "suspended") throw ApiError.forbidden("This account has been suspended.");

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never rejects the
// request. Used on public routes that behave slightly differently for
// logged-in users (e.g. showing "isFavorited").
export const attachUserIfPresent = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.userId);
    if (user && user.status !== "suspended") req.user = user;
  } catch {
    // Ignore invalid/expired tokens on optional-auth routes.
  }
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw ApiError.forbidden("Admin access required.");
  }
  next();
};

export function signToken(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
