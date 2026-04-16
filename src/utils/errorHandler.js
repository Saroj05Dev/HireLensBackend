import ApiError from "./ApiError.js";

/**
 * Handle MongoDB validation and duplicate key errors
 * Converts generic MongoDB errors to user-friendly error messages
 */
export const handleDatabaseError = (error) => {
  // Handle duplicate key error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const fieldNames = {
      'name': 'Organization name',
      'email': 'Email address',
    };
    const fieldName = fieldNames[field] || field;
    return new ApiError(409, `${fieldName} already exists. Please use a different one.`);
  }

  // Handle validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return new ApiError(400, messages[0] || 'Validation failed');
  }

  // Handle cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return new ApiError(400, 'Invalid ID format');
  }

  // If it's already an ApiError, return as is
  if (error instanceof ApiError) {
    return error;
  }

  // Return generic error
  return new ApiError(500, 'Database operation failed');
};

/**
 * Wrap database operations with error handling
 */
export const withDatabaseErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  };
};
