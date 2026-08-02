import Category from "./category.model";
import { PopularCategoryResult } from "./category.type";
import { AppError } from "../../utils/appError.util";
import {
  createListService,
  createGetByBggIdService,
} from "../../utils/crudService.factory";

export const list = createListService(Category, "categories");
export const get = createGetByBggIdService(Category, "categories");

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
          localField: "bgg_id",
          foreignField: "category_ids",
          as: "gameData",
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
            { $project: { _id: 0, bgg_id: 1, name: 1, gameCount: 1 } },
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
      totalCategory: result[0]?.total || 0,
    };
  } catch (error) {
    console.log("Error fetching popular categories: ", error);
    throw new AppError("Error fetching popular categories");
  }
};
