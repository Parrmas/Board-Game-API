import { Request, Response, NextFunction } from "express";
import * as AuthService from "../module/auth/auth.service";

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
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};
