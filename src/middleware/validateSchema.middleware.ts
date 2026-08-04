import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { sendError } from "../utils/response.util";

type RequestPart = "body" | "query" | "params";

export const validateSchema = <T = unknown>(
  schema: ZodType<T>,
  part: RequestPart = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const message = formatZodError(result.error);
      return sendError(res, 400, message);
    }

    // Overwrite with parsed/coerced data (e.g. numbers from query strings)
    req[part] = result.data as any;
    next();
  };
};

const formatZodError = (error: ZodError): string => {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
};