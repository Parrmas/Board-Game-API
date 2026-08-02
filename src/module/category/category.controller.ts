import { Request, Response } from "express";
import * as CategoryService from "./category.service";
import { sendError, sendSuccess } from "../../utils/response.util";
import { AppError } from "../../utils/appError.util";
import {
  createListController,
  createGetController,
} from "../../utils/crudController.factory";

export const list = createListController(CategoryService.list);
export const get = createGetController(CategoryService.get);

export const getPopular = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    if (limit < 1 || limit > 100) {
      return sendError(res, 400, "Limit must be between 1 and 100");
    }

    if (page < 1) {
      return sendError(res, 400, "Page must be at least 1");
    }

    const result = await CategoryService.getPopular(limit, page);
    sendSuccess(res, result);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
  }
};