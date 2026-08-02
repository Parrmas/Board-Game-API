import Publisher, { IPublisher } from "./publisher.model";
import {
  createListService,
  createGetByBggIdService,
} from "../../utils/crudService.factory";

export const list = createListService<IPublisher>(Publisher, "publishers");
export const get = createGetByBggIdService<IPublisher>(Publisher, "publishers");
