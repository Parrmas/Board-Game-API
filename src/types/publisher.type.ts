import { IPublisher } from "../models/publisher.model";

export const FETCH_MIN_LIMIT = 1;
export const FETCH_MAX_LIMIT = 50;

export interface PublisherResult {
  data: IPublisher[];
}
