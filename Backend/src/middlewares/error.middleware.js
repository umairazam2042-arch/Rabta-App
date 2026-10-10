const ApiError = require("../utils/ApiError");

// Agar koi route na mile to ye 404 error banata hai
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// Global error handler: poori app ke errors yahan aa kar ek format mein jate hain
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose validation error (jaise email format galat ho)
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
  }

  // Duplicate key error (unique field pehle se maujood)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Galat MongoDB ID
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

    // Multer errors (jaise file 5MB se bari ho)
  if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be smaller than 5MB"
        : err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    // stack trace sirf development mein dikhao
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };