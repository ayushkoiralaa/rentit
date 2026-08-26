import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Trust the first proxy hop (Render/Railway/Vercel/etc.) so rate
  // limiting and req.ip work correctly behind a load balancer.
  app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  if (env.nodeEnv !== "test") app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  // General API rate limit, with a stricter one on auth to blunt
  // credential-stuffing / brute force attempts.
  app.use(
    "/api",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
  );
  app.use(
    "/api/auth/login",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
  );
  app.use(
    "/api/auth/register",
    rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
  );

  // Uploaded listing images / avatars.
  app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

  // Health check — must never expose secrets or DB internals.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/items", itemRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Keeping __dirname exported avoids an "unused var" footgun if another
// module wants the backend root later (e.g. serving a frontend build).
export { __dirname };
