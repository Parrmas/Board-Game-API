import { z } from "zod";
import { createListQuerySchema } from "../../utils/crudSchema.factory";
import { FETCH_MIN_LIMIT, FETCH_MAX_LIMIT } from "../game/game.type";

export const statsLimitQuerySchema = createListQuerySchema(
  FETCH_MIN_LIMIT,
  FETCH_MAX_LIMIT,
);

export const playerCountParamSchema = z.object({
  player_count: z.coerce.number().int().positive(),
});
