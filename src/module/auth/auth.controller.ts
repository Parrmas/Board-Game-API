import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { ILoginRequest } from "./auth.type";
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

    AuthService.logout(token);

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

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.getHardcodedUser();

    if (await AuthService.isUserLoggedIn()) {
      return res.status(400).json({
        success: false,
        message: "User is already logged in",
      });
    }

    // Return user without sensitive data
    const { ...userData } = user;

    res.json({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfileGames = async (req: Request, res: Response) => {
  try {
    const savedGames = await AuthService.getSavedGame();
    console.log("Check at controller: ", savedGames);
    res.json({
      success: true,
      data: savedGames,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
