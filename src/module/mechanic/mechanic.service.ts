import Mechanic, { IMechanic } from "./mechanic.model";
import {
  createListService,
  createGetByBggIdService,
} from "../../utils/crudService.factory";

export const list = createListService<IMechanic>(Mechanic, "mechanics");
export const get = createGetByBggIdService<IMechanic>(Mechanic, "mechanics");
