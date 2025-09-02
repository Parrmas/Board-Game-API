import Game from "../models/game.model";
import { populateRelatedData } from "../utils/populate.util";
import { GameFilters, GamesResult, POPULATE_CONFIG } from "../types/game.type";
import { buildFilterQuery, getFilterOptions } from "../utils/filter.util";

export const list = async (
  limit: number = 10,
  page: number = 1,
  filters: GameFilters = {},
): Promise<GamesResult> => {
  try {
    const skip = (page - 1) * limit;
    console.log("Filters: ", filters);
    const filterQuery = buildFilterQuery(filters);
    console.log("MongoDB query: ", JSON.stringify(filterQuery, null, 2));

    const games = await Game.find(filterQuery)
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })
      .lean();

    const data = await populateRelatedData(games, POPULATE_CONFIG);
    return {
      data,
    };
  } catch (error) {
    throw new Error(`Error fetching games: ${error}`);
  }
};

export { getFilterOptions };
