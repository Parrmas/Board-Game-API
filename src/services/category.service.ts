import Category, { ICategory } from "../models/category.model";

interface CategoryResult {
  data: ICategory[];
}

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<CategoryResult> => {
  try {
    const skip = limit * page;
    const data = await Category.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 });

    return { data };
  } catch (error) {
    throw new Error(`Error fetching categories: ${error}`);
  }
};

export const get = async (bgg_ids: number[]): Promise<CategoryResult> => {
  try {
    const data = await Category.find({ bgg_id: { $in: bgg_ids } });
    return { data };
  } catch (error) {
    throw new Error(`Error fetching categories: ${error}`);
  }
};
