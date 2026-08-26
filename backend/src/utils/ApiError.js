// A predictable, operational error we can throw anywhere in the app.
// The central error handler knows how to turn this into a clean JSON response.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = "Not authenticated.") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to do this.") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found.") {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
}
