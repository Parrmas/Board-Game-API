import { z } from "zod";

export const createListQuerySchema = (minLimit: number, maxLimit: number) =>
  z.object({
    limit: z.coerce.number().int().min(minLimit).max(maxLimit).default(10),
    page: z.coerce.number().int().min(1).default(1),
  });

export const bggIdParamSchema = z.object({
  bgg_id: z
    .string()
    .min(1)
    .transform((val, ctx) => {
      const ids = val
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
      if (ids.length === 0) {
        ctx.addIssue({ code: "custom", message: "Invalid bgg_id format" });
        return z.NEVER;
      }
      return ids;
    }),
});