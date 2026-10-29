import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export const createMcpLimiter = (limit: number = 60): RequestHandler =>
  rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again in a minute",
    },
  });

const limiter = createMcpLimiter();

export const mcpLimiter: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    next();
    return;
  }

  limiter(req, res, next);
};
