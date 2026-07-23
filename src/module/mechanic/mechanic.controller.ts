import { Request, Response } from "express";
import * as MechanicService from "./mechanic.service";
import { sendError, sendSuccess } from "../../utils/response.util";

export const list = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    if (limit < 1 || limit > 100) {
      return sendError(res, 400, "Limit must be between 1 and 100");
    }

    if (page < 1) {
      return sendError(res, 400, "Page must be at least 1");
    }
    const result = await MechanicService.list(limit, page);
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, 500, error.message);
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

    const result = await MechanicService.get(ids);
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, 500, error.message);
  }
};
