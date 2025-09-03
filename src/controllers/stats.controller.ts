import { Request, Response } from "express";
import * as StatsService from "../services/stats.service";

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

export const getTopGamesByCategory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const category_id = parseInt(req.params.category_id as string);
    const result = await StatsService.getTopGamesByCategory(limit, category_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve top games by category" });
  }
};

export const getTopGamesByMechanic = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const mechanic_id = parseInt(req.params.mechanic_id as string);
    const result = await StatsService.getTopGamesByMechanic(limit, mechanic_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve top games by mechanic" });
  }
};

export const getBestGamesForPlayers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const requestedPlayerCount = parseInt(req.params.number_players as string);
    const result = await StatsService.getBestGamesForPlayers(
      limit,
      requestedPlayerCount,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Failed to retrieve best games for ${req.query.number_players}`,
    });
  }
};
