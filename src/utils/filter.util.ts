import { GameFilters } from "../types/game.type";
import Game from "../models/game.model";

export const buildFilterForOverall = (filters: GameFilters) => {
  const query: any = {};

  // Name filter (case-insensitive partial match)
  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  // Player count filter - USE THE CORRECT FIELD NAMES FROM YOUR SCHEMA
  if (filters.min_players !== undefined || filters.max_players !== undefined) {
    query.$and = query.$and || [];

    // Games where min_player <= requested max_players
    if (filters.max_players !== undefined) {
      query.$and.push({ min_players: { $gte: filters.min_players } }); // Use min_player (singular)
    }
    // Games where max_player >= requested min_players
    if (filters.min_players !== undefined) {
      query.$and.push({ max_players: { $lte: filters.max_players } }); // Use max_player (singular)
    }
  }

  // Playtime filter
  if (
    filters.min_playtime !== undefined ||
    filters.max_playtime !== undefined
  ) {
    query.playing_time = {};
    if (filters.min_playtime !== undefined) {
      query.playing_time.$gte = filters.min_playtime;
    }
    if (filters.max_playtime !== undefined) {
      query.playing_time.$lte = filters.max_playtime;
    }
  }

  // Rating filter
  if (filters.min_rating !== undefined || filters.max_rating !== undefined) {
    query.average_rating = {};
    if (filters.min_rating !== undefined) {
      query.average_rating.$gte = filters.min_rating;
    }
    if (filters.max_rating !== undefined) {
      query.average_rating.$lte = filters.max_rating;
    }
  }

  // Complexity filter
  if (
    filters.min_complexity !== undefined ||
    filters.max_complexity !== undefined
  ) {
    query.complexity_weight = {};
    if (filters.min_complexity !== undefined) {
      query.complexity_weight.$gte = filters.min_complexity;
    }
    if (filters.max_complexity !== undefined) {
      query.complexity_weight.$lte = filters.max_complexity;
    }
  }

  // Array filters (categories, mechanics, designers, publishers)
  const arrayFilters = [
    { field: "category_ids", filter: filters.categories },
    { field: "mechanic_ids", filter: filters.mechanics },
    { field: "designer_ids", filter: filters.designers },
    { field: "publisher_ids", filter: filters.publishers },
  ];

  arrayFilters.forEach(({ field, filter }) => {
    if (filter && filter.length > 0) {
      query[field] = { $in: filter };
    }
  });

  // Clean up empty $and array
  if (query.$and && query.$and.length === 0) {
    delete query.$and;
  }

  return query;
};

export const getFilterOptions = async () => {
  try {
    const [minMaxPlayers, minMaxPlaytime, minMaxRating, minMaxComplexity] =
      await Promise.all([
        Game.aggregate([
          {
            $group: {
              _id: null,
              minPlayers: { $min: "$min_player" },
              maxPlayers: { $max: "$max_player" },
            },
          },
        ]),
        Game.aggregate([
          {
            $group: {
              _id: null,
              minPlaytime: { $min: "$min_playtime" },
              maxPlaytime: { $max: "$max_playtime" },
            },
          },
        ]),
        Game.aggregate([
          {
            $group: {
              _id: null,
              minRating: { $min: "$average_rating" },
              maxRating: { $max: "$average_rating" },
            },
          },
        ]),
        Game.aggregate([
          {
            $group: {
              _id: null,
              minComplexity: { $min: "$complexity_weight" },
              maxComplexity: { $max: "$complexity_weight" },
            },
          },
        ]),
      ]);

    return {
      players: {
        min: minMaxPlayers[0]?.minPlayers || 0,
        max: minMaxPlayers[0]?.maxPlayers || 0,
      },
      playtime: {
        min: minMaxPlaytime[0]?.minPlaytime || 0,
        max: minMaxPlaytime[0]?.maxPlaytime || 0,
      },
      rating: {
        min: minMaxRating[0]?.minRating || 0,
        max: minMaxRating[0]?.maxRating || 0,
      },
      complexity: {
        min: minMaxComplexity[0]?.minComplexity || 0,
        max: minMaxComplexity[0]?.maxComplexity || 0,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching filter options: ${error}`);
  }
};
