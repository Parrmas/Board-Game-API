import { Request, Response } from "express";
import * as GameService from "./game.service";
import { GameFilters } from "./game.type";

export const list = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    // Parse filter parameters
    const filters: GameFilters = {
      name: req.query.name as string,
      min_players: req.query.min_players
        ? parseInt(req.query.min_players as string)
        : undefined,
      max_players: req.query.max_players
        ? parseInt(req.query.max_players as string)
        : undefined,
      min_playtime: req.query.min_playtime
        ? parseInt(req.query.min_playtime as string)
        : undefined,
      max_playtime: req.query.max_playtime
        ? parseInt(req.query.max_playtime as string)
        : undefined,
      min_rating: req.query.min_rating
        ? parseFloat(req.query.min_rating as string)
        : undefined,
      max_rating: req.query.max_rating
        ? parseFloat(req.query.max_rating as string)
        : undefined,
      min_complexity: req.query.min_complexity
        ? parseFloat(req.query.min_complexity as string)
        : undefined,
      max_complexity: req.query.max_complexity
        ? parseFloat(req.query.max_complexity as string)
        : undefined,
      categories: req.query.categories
        ? (req.query.categories as string).split(",").map(Number)
        : undefined,
      mechanics: req.query.mechanics
        ? (req.query.mechanics as string).split(",").map(Number)
        : undefined,
      designers: req.query.designers
        ? (req.query.designers as string).split(",").map(Number)
        : undefined,
      publishers: req.query.publishers
        ? (req.query.publishers as string).split(",").map(Number)
        : undefined,
    };

    Object.keys(filters).forEach((key) => {
      const filterKey = key as keyof GameFilters;
      if (filters[filterKey] === undefined) {
        delete filters[filterKey];
      }
    });

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Limit must be between 1 and 100",
      });
    }

    if (page < 1) {
      return res.status(400).json({
        error: "Page must be at least 1",
      });
    }

    // Pass filters to the service
    const result = await GameService.list(limit, page, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
