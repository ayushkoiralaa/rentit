import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

// Reject anything that isn't a genuinely image-typed, image-extensioned
// file. This is defense-in-depth, not a substitute for the frontend check.
function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(ApiError.badRequest("Only JPG, PNG, WEBP or GIF images are allowed."));
  }
  cb(null, true);
}

export const uploadItemImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxImageSizeMb * 1024 * 1024,
    files: env.maxImagesPerItem,
  },
}).array("images", env.maxImagesPerItem);

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxImageSizeMb * 1024 * 1024, files: 1 },
}).single("avatar");
