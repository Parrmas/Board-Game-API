import { Request, Response, NextFunction } from "express";

export const validateLimit = (minLimit: number = 1, maxLimit: number = 50) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.query.limit) {
      const requestedLimit = parseInt(req.query.limit as string);

      if (isNaN(requestedLimit)) {
        return res.status(400).json({ error: "Limit must be a valid number" });
      }

      if (requestedLimit > maxLimit) {
        return res.status(400).json({
          error: `Limit has to be in the listed range ${minLimit} - ${maxLimit}`,
        });
      }
    }

    next();
  };
};

export const validateQueryNotEmpty = (queryName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.query[queryName];

    if (value === undefined || value === null || value === "") {
      return res.status(400).json({
        error: `Query parameter '${queryName}' is required and cannot be empty.`,
      });
    }
  };
};

export const validateRegisterBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, username, firstName, lastName } = req.body;

  if (!email || !password || !username || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: "email, password, username, firstName, and lastName are all required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  next();
};