import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import * as organizationService from "../services/organization.service.js";

export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.sendSignupOTP(req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.verifySignupOTP(req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const sendPasswordResetOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.sendPasswordResetOTP(req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: "Password reset code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.verifyPasswordResetOTP(req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resetPassword(req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    const { accessToken, refreshToken } = result.tokens;

    const isProduction = process.env.NODE_ENV === "production";
    
    // Use more permissive settings for better incognito compatibility
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as "lax", // Use lax instead of none for better compatibility
      secure: isProduction, // Only secure in production (HTTPS)
      path: "/",
      domain: isProduction ? ".onrender.com" : undefined, // Set domain for cross-subdomain sharing
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        organization: result.organization,
      },
      message: "Organization and admin user created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, tokens } = await authService.login(req.body);

    const isProduction = process.env.NODE_ENV === "production";
    
    // For cross-origin requests (different domains), we need sameSite: "none"
    const cookieOptions = {
      httpOnly: true,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      secure: isProduction, // Required when sameSite is "none"
      path: "/",
    };

    console.log('Setting cookies with options:', cookieOptions);
    console.log('Request headers:', req.headers);

    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: user,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Use more permissive settings for better incognito compatibility
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as "lax", // Use lax instead of none for better compatibility
    secure: isProduction, // Only secure in production (HTTPS)
    path: "/",
    domain: isProduction ? ".onrender.com" : undefined, // Set domain for cross-subdomain sharing
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await authService.refresh(req.cookies);

    const isProduction = process.env.NODE_ENV === "production";
    
    // Use more permissive settings for better incognito compatibility
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as "lax", // Use lax instead of none for better compatibility
      secure: isProduction, // Only secure in production (HTTPS)
      path: "/",
      domain: isProduction ? ".onrender.com" : undefined, // Set domain for cross-subdomain sharing
    };

    res.cookie("accessToken", token.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const fetchMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const user = await authService.fetchMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const validateInviteToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const tokenStr = Array.isArray(token) ? token[0] : token;

    if (!tokenStr) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const inviteDetails = await organizationService.validateInviteToken(tokenStr);

    return res.status(200).json({
      success: true,
      data: inviteDetails,
      message: "Invitation validated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, name, password } = req.body;
    const result = await authService.acceptInvite({ token, name, password });
    const { accessToken, refreshToken } = result.tokens;

    const isProduction = process.env.NODE_ENV === "production";
    
    // Use more permissive settings for better incognito compatibility
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as "lax", // Use lax instead of none for better compatibility
      secure: isProduction, // Only secure in production (HTTPS)
      path: "/",
      domain: isProduction ? ".onrender.com" : undefined, // Set domain for cross-subdomain sharing
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: result.user,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    next(error);
  }
};