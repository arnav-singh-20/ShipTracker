// Catches requests to routes that don't exist and forwards a clean 404
// into the error handler below, instead of Express's default HTML error page.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Single place where every error in the app ends up (via next(err) or a thrown
// error in an async route wrapped by a try/catch). This keeps controllers free
// of repetitive status-code/formatting logic - they just throw or call next(err).
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';

  // Mongoose bad ObjectId (e.g. malformed :id in a URL param)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key error (e.g. duplicate email on signup)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose validation error (schema-level required/min/max/match failures)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
    // Only leak stack traces in development - never in production responses.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
