import { z } from "zod";

export const sendOTPSchema = z.object({
    email: z.string().trim().email("Please provide a valid email address").max(100, "Email must be at most 100 characters long"),
});

export const verifyOTPSchema = z.object({
    email: z.string().trim().email("Please provide a valid email address").max(100, "Email must be at most 100 characters long"),
    otp: z.string().trim().length(6, "OTP must be exactly 6 digits"),
});

export const resetPasswordSchema = z.object({
    email: z.string().trim().email("Please provide a valid email address").max(100, "Email must be at most 100 characters long"),
    otp: z.string().trim().length(6, "OTP must be exactly 6 digits"),
    newPassword: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters long"),
    email: z.string().trim().email("Please provide a valid email address").max(100, "Email must be at most 100 characters long"),
    password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
    organizationName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters long")
    .max(100, "Organization name must be at most 100 characters long"),
});

export const loginSchema = z.object({
    email: z.string().trim().email("Please provide a valid email address").max(100, "Email must be at most 100 characters long"),
    password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

export const acceptInviteSchema = z.object({
    token: z.string().trim().min(1, "Token is required"),
    name: z.string().trim().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters long"),
    password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});