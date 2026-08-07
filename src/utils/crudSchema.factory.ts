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
      const tokens = val.split(",").map((t) => t.trim());
      const ids: number[] = [];
      for (const token of tokens) {
        const id = parseInt(token, 10);
        if (isNaN(id)) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid bgg_id: "${token}"`,
          });
          return z.NEVER;
        }
        ids.push(id);
      }
      return ids;
    }),
});
