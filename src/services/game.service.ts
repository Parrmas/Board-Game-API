import { populate } from "dotenv";
import Game, { IGame } from "../models/game.model";
import * as CategoryService from "./category.service";

interface GamesResult {
  data: IGame[];
}

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<GamesResult> => {
  try {
    const skip = (page - 1) * limit;
    const games = await Game.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })
      .lean();

    const allCategoriesIds = games.flatMap((game) => game.category_ids || []);
    const uniqueCategories = [...new Set(allCategoriesIds)];
    const categories = await CategoryService.get(uniqueCategories);

    const categoryMap = new Map();
    categories.data.forEach((cat) => {
      categoryMap.set(cat.bgg_id, cat);
    });

    const data = games.map((game) => {
      const gameCategories = (game.category_ids || [])
        .map((id) => categoryMap.get(id))
        .filter(Boolean);
      const { category_ids, ...gameWithoutCategoryIds } = game;
      return {
        ...gameWithoutCategoryIds,
        categories: gameCategories,
      };
    });
    return {
      data,
    };
  } catch (error) {
    throw new Error(`Error fetching games: ${error}`);
  }
};
