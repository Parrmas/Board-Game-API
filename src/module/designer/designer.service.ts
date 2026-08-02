import Designer, { IDesigner } from "./designer.model";
import {
  createListService,
  createGetByBggIdService,
} from "../../utils/crudService.factory";

export const list = createListService<IDesigner>(Designer, "designers");
export const get = createGetByBggIdService<IDesigner>(Designer, "designers");
