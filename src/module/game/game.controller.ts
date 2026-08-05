import { Request, Response } from "express";
import * as GameService from "./game.service";
import { sendError, sendSuccess } from "../../utils/response.util";
import { getFilterOptions as getFilterOptionsService } from "../../utils/filter.util";
import { AppError } from "../../utils/appError.util";
import { GameListQuery } from "./game.schema";

// game.controller.ts — list() becomes:
export const list = async (req: Request, res: Response) => {
  try {
    const { limit, page, ...filters } = req.query as unknown as GameListQuery;
    const result = await GameService.list(limit, page, filters);
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError)
      return sendError(res, error.statusCode, error.message);
    console.error(error);
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
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};

export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const result = await getFilterOptionsService();
    sendSuccess(res, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Failed to fetch filter options");
  }
};
