import Game from "./game.model";
import { populateRelatedData } from "../../utils/populate.util";
import { GameFilters, GamesResult, POPULATE_CONFIG } from "./game.type";
import {
  buildFilterForOverall,
  getFilterOptions,
} from "../../utils/filter.util";

export const list = async (
  limit: number = 10,
  page: number = 1,
  filters: GameFilters = {},
): Promise<GamesResult> => {
  try {
    const skip = (page - 1) * limit;
    const filterQuery = buildFilterForOverall(filters);

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
