import * as DesignerService from "./designer.service";
import {
  createListController,
  createGetController,
} from "../../utils/crudController.factory";

export const list = createListController(DesignerService.list);
export const get = createGetController(DesignerService.get);
