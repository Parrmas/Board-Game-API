import { createListQuerySchema } from "../../utils/crudSchema.factory";
import { FETCH_MIN_LIMIT, FETCH_MAX_LIMIT } from "./category.type";

export const categoryListQuerySchema = createListQuerySchema(
  FETCH_MIN_LIMIT,
  FETCH_MAX_LIMIT,
);

export const categoryPopularQuerySchema = categoryListQuerySchema;