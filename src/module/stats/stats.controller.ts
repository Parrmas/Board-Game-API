import { Request, Response } from "express";
import * as StatsService from "./stats.service";
import { sendError, sendSuccess } from "../../utils/response.util";
import { AppError } from "../../utils/appError.util";

export const getOverallStats = async (req: Request, res: Response) => {
  try {
    const stats = await StatsService.getOverallStats();
    sendSuccess(res, stats);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};

export const getTopRatedGames = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await StatsService.getTopRatedGames(limit);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};

export const getMostComplexGames = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await StatsService.getMostComplexGames(limit);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};

export const getBestGamesForPlayers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const requestedPlayerCount = parseInt(req.params.player_count as string);
    const result = await StatsService.getBestGamesForPlayers(
      limit,
      requestedPlayerCount,
    );
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};
