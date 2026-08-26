import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Single place that turns any thrown error into a clean, production-safe
// JSON response. Never leaks stack traces or internals outside development.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  // Translate common Mongoose/driver errors into friendly ApiErrors.
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || { field: 1 })[0];
    message = `That ${field} is already in use.`;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier provided.";
  }

  statusCode = statusCode || 500;
  message = message || "Something went wrong on our end.";

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(env.nodeEnv === "development" && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}
