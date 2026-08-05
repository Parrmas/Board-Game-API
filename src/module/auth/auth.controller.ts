import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import {
  ILoginRequest,
  IRegisterRequest,
  IRefreshTokenRequest,
} from "./auth.type";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { sendError, sendSuccess } from "../../utils/response.util";
import { AppError } from "../../utils/appError.util";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} from "../../utils/cookieHelper.util";

export const login = async (req: Request, res: Response) => {
  try {
    const loginData: ILoginRequest = req.body;
    const result = await AuthService.login(loginData);

    setRefreshTokenCookie(res, result.refreshToken); // Set refresh token in HTTP-only cookie
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error during login: ", error);
    sendError(res, 500, "Internal server error");
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!incomingRefreshToken) {
      return sendError(res, 401, "Refresh token missing");
    }

    const { token, refreshToken: newRefreshToken } =
      await AuthService.refreshAccessToken(incomingRefreshToken);

    setRefreshTokenCookie(res, newRefreshToken);
    sendSuccess(res, { token });
  } catch (error: any) {
    if (error instanceof AppError) {
      clearRefreshTokenCookie(res); // stale/invalid cookie — don't leave it hanging around
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error refreshing token: ", error);
    sendError(res, 500, "Internal server error");
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
    clearRefreshTokenCookie(res); // Clear the refresh token cookie

    sendSuccess(res, { message: "User logged out successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error during logout: ", error);
    sendError(res, 500, "Internal server error");
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
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};

export const getProfileGames = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const savedGames = await AuthService.getSavedGame(userId);
    sendSuccess(res, savedGames);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error fetching profile games: ", error);
    sendError(res, 500, "Internal server error");
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const registerData: IRegisterRequest = req.body;
    const result = await AuthService.register(registerData);

    sendSuccess(res, result, 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error during registration: ", error);
    sendError(res, 500, "Internal server error");
  }
};

export const addProfileGame = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error adding profile game: ", error);
    sendError(res, 500, "Internal server error");
  }
};

export const removeProfileGame = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error("Error removing profile game: ", error);
    sendError(res, 500, "Internal server error");
  }
};
