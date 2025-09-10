import { Request, Response } from "express";
import * as StatsService from "./stats.service";

export const getOverallStats = async (req: Request, res: Response) => {
  try {
    const stats = await StatsService.getOverallStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve statistics" });
  }
};

export const getTopRatedGames = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await StatsService.getTopRatedGames(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve top rated games" });
  }
};

export const getMostComplexGames = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await StatsService.getMostComplexGames(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve most complex games" });
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
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Failed to retrieve best games for ${req.query.player_count}`,
    });
  }
};
