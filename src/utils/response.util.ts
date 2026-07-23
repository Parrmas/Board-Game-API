import { Response } from "express";

export const sendError = (res: Response, status: number, message: string) => {
  return res.status(status).json({ success: false, message });
};

export const sendSuccess = <T,>(res: Response, data: T, status = 200) => {
  return res.status(status).json({ success: true, data });
};