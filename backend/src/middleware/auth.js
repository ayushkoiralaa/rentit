import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";

/**
 * Require a valid JWT.
 *
 * Used for protected routes where the user must be logged in.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Access denied. Token missing.");
  }

  const token = header.substring(7).trim();

  if (!token) {
    throw ApiError.unauthorized("Access denied. Token missing.");
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw ApiError.unauthorized("Invalid or expired token.");
  }

  if (!payload || !payload.userId) {
    throw ApiError.unauthorized("Invalid token.");
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    throw ApiError.unauthorized("Account no longer exists.");
  }

  if (user.status === "suspended") {
    throw ApiError.forbidden("This account has been suspended.");
  }

  req.user = user;

  next();
});


/**
 * Optional authentication.
 *
 * Used on public routes where a logged-in user gets
 * additional functionality, but login is NOT required.
 */
export const attachUserIfPresent = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.substring(7).trim();

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (!payload || !payload.userId) {
      return next();
    }

    const user = await User.findById(payload.userId);

    if (user && user.status !== "suspended") {
      req.user = user;
    }
  } catch {
    // Optional authentication:
    // Ignore invalid/expired tokens.
  }

  next();
});


/**
 * Require administrator privileges.
 *
 * This middleware must be used AFTER requireAuth.
 */
export const requireAdmin = (req, _res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }

  if (req.user.role !== "admin") {
    throw ApiError.forbidden("Admin access required.");
  }

  next();
};


/**
 * Create JWT token for authenticated user.
 */
export function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}