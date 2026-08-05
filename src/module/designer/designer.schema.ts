import { createListQuerySchema } from "../../utils/crudSchema.factory";
import { FETCH_MIN_LIMIT, FETCH_MAX_LIMIT } from "./designer.type";

export const designerListQuerySchema = createListQuerySchema(
  FETCH_MIN_LIMIT,
  FETCH_MAX_LIMIT,
);
