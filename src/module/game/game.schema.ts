import { z } from "zod";
import { FETCH_MIN_LIMIT, FETCH_MAX_LIMIT } from "./game.type";
import { bggIdParamSchema } from "../../utils/crudSchema.factory";

const csvNumbers = () =>
  z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val.split(",").map((s) => {
            const n = Number(s.trim());
            if (Number.isNaN(n)) {
              throw new Error(`Invalid number in list: "${s}"`);
            }
            return n;
          })
        : undefined,
    );

export const gameListQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(FETCH_MIN_LIMIT)
      .max(FETCH_MAX_LIMIT)
      .default(10),
    page: z.coerce.number().int().min(1).default(1),
    name: z.string().trim().min(1).optional(),
    min_players: z.coerce.number().int().positive().optional(),
    max_players: z.coerce.number().int().positive().optional(),
    min_playtime: z.coerce.number().int().nonnegative().optional(),
    max_playtime: z.coerce.number().int().nonnegative().optional(),
    min_rating: z.coerce.number().min(0).max(10).optional(),
    max_rating: z.coerce.number().min(0).max(10).optional(),
    min_complexity: z.coerce.number().min(0).max(5).optional(),
    max_complexity: z.coerce.number().min(0).max(5).optional(),
    categories: csvNumbers(),
    mechanics: csvNumbers(),
    designers: csvNumbers(),
    publishers: csvNumbers(),
  })
  .refine(
    (data) =>
      data.min_players === undefined ||
      data.max_players === undefined ||
      data.min_players <= data.max_players,
    { message: "min_players must be <= max_players", path: ["min_players"] },
  )
  .refine(
    (data) =>
      data.min_rating === undefined ||
      data.max_rating === undefined ||
      data.min_rating <= data.max_rating,
    { message: "min_rating must be <= max_rating", path: ["min_rating"] },
  );

export type GameListQuery = z.infer<typeof gameListQuerySchema>;

export { bggIdParamSchema };
