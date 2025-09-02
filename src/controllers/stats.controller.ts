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
