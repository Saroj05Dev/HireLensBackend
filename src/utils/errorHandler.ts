import ApiError from "./ApiError.js";

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyPattern?: Record<string, number>;
}

interface MongoValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
}

export const handleDatabaseError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  const err = error as Record<string, any>;

  // Handle duplicate key error (E11000)
  if (err?.code === 11000 && err.keyPattern) {
    const field = Object.keys(err.keyPattern)[0];
    const fieldNames: Record<string, string> = {
      name: "Organization name",
      email: "Email address",
    };
    const fieldName = fieldNames[field] || field;
    return new ApiError(409, `${fieldName} already exists. Please use a different one.`);
  }

  // Handle validation error
  if (err?.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors as Record<string, { message: string }>).map((e) => e.message);
    return new ApiError(400, messages[0] || "Validation failed");
  }

  // Handle cast error (invalid ObjectId)
  if (err?.name === "CastError") {
    return new ApiError(400, "Invalid ID format");
  }

  // Return generic error
  return new ApiError(500, "Database operation failed");
};

/**
 * Wrap database operations with error handling
 */
export const withDatabaseErrorHandling = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  };
};