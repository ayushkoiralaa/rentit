import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

// Run this after an array of express-validator checks to turn failures
// into a single, clean 400 response instead of letting bad data through.
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.badRequest("Please fix the highlighted fields.", details));
}
