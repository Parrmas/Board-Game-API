import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { ILoginRequest, IRegisterRequest } from "./auth.type";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { sendError, sendSuccess } from "../../utils/response.util";

export const login = async (req: Request, res: Response) => {
  try {
    const loginData: ILoginRequest = req.body;
    const result = await AuthService.login(loginData);

    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, 401, error.message);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return sendError(res, 400, "Token is required for logout");
    }

    await AuthService.logout(token);

    sendSuccess(res, { message: "User logged out successfully" });
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }
    const user = await AuthService.getUserById(userId);

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 500, error.message);
  }
};

export const getProfileGames = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const savedGames = await AuthService.getSavedGame(userId);
    sendSuccess(res, savedGames);
  } catch (error: any) {
    if (error.message === "User not found") {
      return sendError(res, 404, error.message);
    }
    sendError(res, 500, error.message);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const registerData: IRegisterRequest = req.body;
    const result = await AuthService.register(registerData);

    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
};

export const addProfileGame = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const bggId = parseInt(req.params.bgg_id, 10);
    if (isNaN(bggId)) {
      return sendError(res, 400, "Invalid bgg_id");
    }

    const data = await AuthService.addSavedGame(userId, bggId);
    sendSuccess(res, data);
  } catch (error: any) {
    if (error.message === "User not found") {
      return sendError(res, 404, error.message);
    }
    sendError(res, 500, error.message);
  }
};

export const removeProfileGame = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const bggId = parseInt(req.params.bgg_id, 10);
    if (isNaN(bggId)) {
      return sendError(res, 400, "Invalid bgg_id");
    }

    const data = await AuthService.removeSavedGame(userId, bggId);
    sendSuccess(res, data);
  } catch (error: any) {
    if (error.message === "User not found") {
      return sendError(res, 404, error.message);
    }
    return sendError(res, 500, error.message);
  }
};