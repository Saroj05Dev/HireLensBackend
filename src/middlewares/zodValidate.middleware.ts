import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

type RequestLocation = "body" | "query" | "params";

export const zodValidate = (
    schema: ZodSchema, 
    location: RequestLocation = "body"
) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req[location]);
            req[location] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", ");
                return next(new ApiError(400, `Validation error: ${errorMessages}`));
            }
            next(error);  
        }
    }
}