import { Request, Response } from "express";
import { ZodType } from "zod";
import { sendError, sendSuccess } from "./response.util";
import { AppError } from "./appError.util";

interface ListQuery {
  limit: number;
  page: number;
}

export const createListController = <T = unknown>(
  listService: (limit: number, page: number) => Promise<{ data: T[] }>,
) => {
  return async (req: Request, res: Response) => {
    try {
      // req.query has already been parsed + validated by validateSchema middleware
      const { limit, page } = req.query as unknown as ListQuery;

      const result = await listService(limit, page);
      sendSuccess(res, result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return sendError(res, error.statusCode, error.message);
      }
      console.error(error);
      sendError(res, 500, "Internal server error");
    }
  };
};

export const createGetController = <T = unknown>(
  getService: (ids: number[]) => Promise<{ data: T[] }>,
) => {
  return async (req: Request, res: Response) => {
    try {
      // req.params.bgg_id has already been transformed into number[] by validateSchema
      const ids = req.params.bgg_id as unknown as number[];

      const result = await getService(ids);
      sendSuccess(res, result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return sendError(res, error.statusCode, error.message);
      }
      console.error(error);
      sendError(res, 500, "Internal server error");
    }
  };
};
