import { Request, Response } from "express";
import * as MechanicService from "../services/mechanic.service";

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
    const result = await MechanicService.list(limit, page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ Error: error });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const query = req.query.bgg_id as string;
    if (!query) {
      return res
        .status(400)
        .json({ error: "bgg_id query parameter is required" });
    }
    const ids = query
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return res.status(400).json({ error: "Invalid bgg_id format" });
    }

    const result = await MechanicService.get(ids);
    res.json(result);
  } catch (error) {
    res.status(500).json({ Error: error });
  }
};
