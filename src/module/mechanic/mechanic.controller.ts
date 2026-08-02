import * as MechanicService from "./mechanic.service";
import {
  createListController,
  createGetController,
} from "../../utils/crudController.factory";

export const list = createListController(MechanicService.list);
export const get = createGetController(MechanicService.get);