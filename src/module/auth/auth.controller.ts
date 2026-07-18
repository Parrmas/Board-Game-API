import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { ILoginRequest, IRegisterRequest } from "./auth.type";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const login = async (req: Request, res: Response) => {
  try {
    const loginData: ILoginRequest = req.body;
    const result = await AuthService.login(loginData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required for logout",
      });
    }

    await AuthService.logout(token);

    res.json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await AuthService.getUserById(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfileGames = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const savedGames = await AuthService.getSavedGame(userId);
    res.json({
      success: true,
      data: savedGames,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const registerData: IRegisterRequest = req.body;
    const result = await AuthService.register(registerData);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
  }
};