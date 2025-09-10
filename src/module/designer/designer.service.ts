import Designer from "./designer.model";
import { DesignerResult } from "./designer.type";

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<DesignerResult> => {
  try {
    const skip = limit * page;
    const data = await Designer.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })
      .lean();

    return { data };
  } catch (error) {
    throw new Error(`Error fetching Designers: ${error}`);
  }
};

export const get = async (bgg_ids: number[]): Promise<DesignerResult> => {
  try {
    const data = await Designer.find({ bgg_id: { $in: bgg_ids } }).lean();
    return { data };
  } catch (error) {
    throw new Error(`Error fetching Designers: ${error}`);
  }
};
