import { Request, Response } from "express";
import * as GameService from "./game.service";
import { sendError, sendSuccess } from "../../utils/response.util";
import { getFilterOptions as getFilterOptionsService } from "../../utils/filter.util";
import { AppError } from "../../utils/appError.util";
import { GameListQuery } from "./game.schema";
import { createGetController } from "../../utils/crudController.factory";

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

export const get = createGetController(GameService.get);

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
