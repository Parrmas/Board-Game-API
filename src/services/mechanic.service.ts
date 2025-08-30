import Mechanic, { IMechanic } from "../models/mechanic.model";

interface MechanicResult {
  data: IMechanic[];
}

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<MechanicResult> => {
  try {
    const skip = limit * page;
    const data = await Mechanic.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 });

    return { data };
  } catch (error) {
    throw new Error(`Error fetching mechanics: ${error}`);
  }
};

export const get = async (bgg_ids: number[]): Promise<MechanicResult> => {
  try {
    const data = await Mechanic.find({ bgg_id: { $in: bgg_ids } });
    return { data };
  } catch (error) {
    throw new Error(`Error fetching mechanics: ${error}`);
  }
};
