import Category from "./category.model";
import { CategoryResult, PopularCategoryResult } from "./category.type";

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

export const getPopular = async (
  limit: number = 10,
  page: number = 1,
): Promise<PopularCategoryResult> => {
  try {
    const skip = (page - 1) * limit;

    const result = await Category.aggregate([
      {
        $lookup: {
          from: "games",
          localField: "_id",
          foreignField: "category_ids",
          as: "gameData",
          pipeline: [{ $project: { _id: 1 } }],
        },
      },
      {
        $addFields: {
          gameCount: { $size: "$gameData" },
        },
      },
      {
        $match: {
          gameCount: { $gt: 0 },
        },
      },
      {
        $sort: {
          gameCount: -1,
          name: 1,
        },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            { $project: { gameData: 0 } },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$total.count", 0] },
        },
      },
    ]);

    return {
      data: result[0]?.data || [],
      total: result[0]?.total || 0,
    };
  } catch (error) {
    throw new Error(`Error fetching popular categories: ${error}`);
  }
};
