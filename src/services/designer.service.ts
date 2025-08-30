import Designer, { IDesigner } from "../models/designer.model";

interface DesignerResult {
  data: IDesigner[];
}

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<DesignerResult> => {
  try {
    const skip = limit * page;
    const data = await Designer.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 });

    return { data };
  } catch (error) {
    throw new Error(`Error fetching Designers: ${error}`);
  }
};

export const get = async (bgg_ids: number[]): Promise<DesignerResult> => {
  try {
    const data = await Designer.find({ bgg_id: { $in: bgg_ids } });
    return { data };
  } catch (error) {
    throw new Error(`Error fetching Designers: ${error}`);
  }
};
