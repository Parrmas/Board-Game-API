import * as PublisherService from "./publisher.service";
import {
  createListController,
  createGetController,
} from "../../utils/crudController.factory";

export const list = createListController(PublisherService.list);
export const get = createGetController(PublisherService.get);
