import { createListQuerySchema } from "../../utils/crudSchema.factory";
import { FETCH_MIN_LIMIT, FETCH_MAX_LIMIT } from "./publisher.type";

export const publisherListQuerySchema = createListQuerySchema(
  FETCH_MIN_LIMIT,
  FETCH_MAX_LIMIT,
);
