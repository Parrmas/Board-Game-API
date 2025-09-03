import { IDesigner } from "../models/designer.model";

export const FETCH_MIN_LIMIT = 1;
export const FETCH_MAX_LIMIT = 50;

export interface DesignerResult {
  data: IDesigner[];
}
