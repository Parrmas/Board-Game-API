import { Model } from "mongoose";
import { AppError } from "./appError.util";

export interface ListResult<T> {
  data: T[];
}

export const createListService = <T,>(model: Model<T>, entityName: string) => {
  return async (limit: number = 10, page: number = 1): Promise<ListResult<T>> => {
    try {
      const skip = limit * (page - 1);
      const data = await model
        .find()
        .limit(limit)
        .skip(skip)
        .sort({ name: 1 })
        .lean();
      return { data: data as T[] };
    } catch (error) {
      console.error(`Error fetching ${entityName}: `, error);
      throw new AppError(`Failed to fetch ${entityName}`, 500);
    }
  };
};

export const createGetByBggIdService = <T,>(model: Model<T>, entityName: string) => {
  return async (bgg_ids: number[]): Promise<ListResult<T>> => {
    try {
      const data = await model.find({ bgg_id: { $in: bgg_ids } }).lean();
      return { data: data as T[] };
    } catch (error) {
      console.error(`Error fetching ${entityName}: `, error);
      throw new AppError(`Failed to fetch ${entityName}`, 500);
    }
  };
};