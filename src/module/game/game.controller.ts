import { Request, Response } from "express";
import * as GameService from "./game.service";
import { GameFilters } from "./game.type";
import { sendError, sendSuccess } from "../../utils/response.util";
import { getFilterOptions as getFilterOptionsService } from "../../utils/filter.util";

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
      return sendError(res, 400, "Limit must be between 1 and 100");
    }

    if (page < 1) {
      return sendError(res, 400, "Page must be at least 1");
    }

    // Pass filters to the service
    const result = await GameService.list(limit, page, filters);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 500, "Internal server error");
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const params = req.params.bgg_id as string;
    if (!params) {
      return sendError(res, 400, "bgg_id parameter is required");
    }
    const ids = params
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return sendError(res, 400, "Invalid bgg_id format");
    }

    const result = await GameService.get(ids);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, 500, "Internal server error");
  }
};

export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const result = await getFilterOptionsService();
    sendSuccess(res, result);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch filter options");
  }
};
