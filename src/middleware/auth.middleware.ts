import { Request, Response, NextFunction } from "express";
import * as AuthService from "../module/auth/auth.service";
import { AppError } from "../utils/appError.util";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = await AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: unknown) {
    const status = error instanceof AppError ? error.statusCode : 401;
    const message =
      error instanceof Error ? error.message : "Invalid or expired token";
    return res.status(status).json({ success: false, message });
  }
};
