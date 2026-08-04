import { createListQuerySchema } from "../../utils/crudSchema.factory";
import { FETCH_MIN_LIMIT, FETCH_MAX_LIMIT } from "./mechanic.type";

export const mechanicListQuerySchema = createListQuerySchema(
  FETCH_MIN_LIMIT,
  FETCH_MAX_LIMIT,
);