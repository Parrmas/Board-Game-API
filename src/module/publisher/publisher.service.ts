import Publisher from "./publisher.model";
import { PublisherResult } from "./publisher.type";

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<PublisherResult> => {
  try {
    const skip = limit * page;
    const data = await Publisher.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })
      .lean();

    return { data };
  } catch (error) {
    throw new Error(`Error fetching publishers: ${error}`);
  }
};

export const get = async (bgg_ids: number[]): Promise<PublisherResult> => {
  try {
    const data = await Publisher.find({ bgg_id: { $in: bgg_ids } }).lean();
    return { data };
  } catch (error) {
    throw new Error(`Error fetching publishers: ${error}`);
  }
};
