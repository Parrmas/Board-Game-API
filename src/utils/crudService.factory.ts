import { Model } from "mongoose";
import { AppError } from "./appError.util";
import { escapeRegex } from "./regex.util";

export interface ListResult<T> {
  data: T[];
}

export const createListService = <T = unknown>(
  model: Model<T>,
  entityName: string,
) => {
  return async (
    limit: number = 10,
    page: number = 1,
    name?: string,
  ): Promise<ListResult<T>> => {
    try {
      const skip = limit * (page - 1);
      const query = name
        ? model.find({
            name: { $regex: escapeRegex(name), $options: "i" },
          } as any)
        : model.find();
      const data = await query.limit(limit).skip(skip).sort({ name: 1 }).lean();
      return { data: data as T[] };
    } catch (error) {
      console.error(`Error fetching ${entityName}: `, error);
      throw new AppError(`Failed to fetch ${entityName}`, 500);
    }
  };
};

export const createGetByBggIdService = <T = unknown>(
  model: Model<T>,
  entityName: string,
) => {
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
