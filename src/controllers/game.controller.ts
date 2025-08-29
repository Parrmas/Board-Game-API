import { Request, Response } from "express";
import * as GameService from "../services/game.service";

export const list = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

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

    const result = await GameService.list(limit, page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ Error: error });
  }
};
