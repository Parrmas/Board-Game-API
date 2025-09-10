import Mechanic, { IMechanic } from "./mechanic.model";
import { MechanicResult } from "./mechanic.type";

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<MechanicResult> => {
  try {
    const skip = limit * page;
    const data = await Mechanic.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })
      .lean();

    return { data };
  } catch (error) {
    throw new Error(`Error fetching mechanics: ${error}`);
  }
};

export const get = async (bgg_ids: number[]): Promise<MechanicResult> => {
  try {
    const data = await Mechanic.find({ bgg_id: { $in: bgg_ids } }).lean();
    return { data };
  } catch (error) {
    throw new Error(`Error fetching mechanics: ${error}`);
  }
};
