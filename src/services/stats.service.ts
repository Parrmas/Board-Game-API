import { populate } from "dotenv";
import Game, { IGame } from "../models/game.model";
import { GamesResult, POPULATE_CONFIG } from "../types/game.type";
import { OverallStats } from "../types/stats.type";
import { populateRelatedData } from "../utils/populate.util";
import gameModel from "../models/game.model";

export const getOverallStats = async (): Promise<OverallStats> => {
  try {
    const aggregationResult = await Game.aggregate([
      {
        $facet: {
          // Database Summary
          summary: [
            {
              $group: {
                _id: null,
                totalGames: { $sum: 1 },
                allDesignerIds: { $push: "$designer_ids" },
                allPublisherIds: { $push: "$publisher_ids" },
                allCategoryIds: { $push: "$category_ids" },
                allMechanicIds: { $push: "$mechanic_ids" },
                totalRating: { $sum: "$average_rating" },
                totalComplexity: { $sum: "$complexity_weight" },
                minYear: { $min: "$year_published" },
                maxYear: { $max: "$year_published" },
              },
            },
            {
              $project: {
                _id: 0,
                totalGames: 1,
                totalDesigners: {
                  $size: {
                    $reduce: {
                      input: "$allDesignerIds",
                      initialValue: [],
                      in: { $setUnion: ["$$value", "$$this"] },
                    },
                  },
                },
                totalPublishers: {
                  $size: {
                    $reduce: {
                      input: "$allPublisherIds",
                      initialValue: [],
                      in: { $setUnion: ["$$value", "$$this"] },
                    },
                  },
                },
                totalCategories: {
                  $size: {
                    $reduce: {
                      input: "$allCategoryIds",
                      initialValue: [],
                      in: { $setUnion: ["$$value", "$$this"] },
                    },
                  },
                },
                totalMechanics: {
                  $size: {
                    $reduce: {
                      input: "$allMechanicIds",
                      initialValue: [],
                      in: { $setUnion: ["$$value", "$$this"] },
                    },
                  },
                },
                averageRating: { $divide: ["$totalRating", "$totalGames"] },
                averageComplexity: {
                  $divide: ["$totalComplexity", "$totalGames"],
                },
                yearRange: { min: "$minYear", max: "$maxYear" },
              },
            },
          ],

          // Games by player count
          players: [
            {
              $addFields: {
                supportedPlayerCounts: {
                  $range: ["$min_players", { $add: ["$max_players", 1] }],
                },
              },
            },
            { $unwind: "$supportedPlayerCounts" },
            {
              $group: {
                _id: "$supportedPlayerCounts",
                gameCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                playerCount: "$_id",
                gameCount: 1,
              },
            },
          ],

          // Games by play time
          playtime: [
            {
              $bucket: {
                groupBy: "$playing_time",
                boundaries: [0, 30, 60, 120, 180, 240, 300], // Buckets in minutes: 0-30, 30-60, etc.
                default: "300+",
                output: {
                  gameCount: { $sum: 1 },
                },
              },
            },
            {
              $project: {
                _id: 0,
                range: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$_id", 0] }, then: "0-30 min" },
                      { case: { $eq: ["$_id", 30] }, then: "30-60 min" },
                      { case: { $eq: ["$_id", 60] }, then: "1-2 hrs" },
                      { case: { $eq: ["$_id", 120] }, then: "2-3 hrs" },
                      { case: { $eq: ["$_id", 180] }, then: "3-4 hrs" },
                      { case: { $eq: ["$_id", 240] }, then: "4-5 hrs" },
                    ],
                    default: "5+ hrs",
                  },
                },
                gameCount: 1,
              },
            },
            { $sort: { range: 1 } },
          ],

          // Games published by year
          byYear: [
            { $match: { year_published: { $gt: 0 } } },
            {
              $group: {
                _id: "$year_published",
                gameCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                year: "$_id",
                gameCount: 1,
              },
            },
          ],
        },
      },
    ]);

    const result = aggregationResult[0];

    const formattedResult: OverallStats = {
      summary: result.summary[0],
      players: result.players,
      playtime: result.playtime,
      byYear: result.byYear,
    };

    return formattedResult;
  } catch (error) {
    throw new Error(`Failed to fetch overall statistics: ${error}`);
  }
};

export const getTopRatedGames = async (
  limit: number = 10,
): Promise<GamesResult> => {
  try {
    const games = await Game.find()
      .sort({ average_rating: -1 })
      .limit(limit)
      .lean();
    const data = await populateRelatedData(games, POPULATE_CONFIG);

    return { data };
  } catch (error) {
    throw new Error(`Failed to fetch top rated games: ${error}`);
  }
};

export const getMostComplexGames = async (
  limit: number = 10,
): Promise<GamesResult> => {
  try {
    const games = await Game.find()
      .sort({ complexity_weight: -1 })
      .limit(limit)
      .lean();
    const data = await populateRelatedData(games, POPULATE_CONFIG);

    return { data };
  } catch (error) {
    throw new Error(`Failed to fetch most complex games: ${error}`);
  }
};

export const getTopGamesByCategory = async (
  limit: number = 10,
  category_id: number,
): Promise<GamesResult> => {
  try {
    const games = await Game.find({ category_ids: category_id })
      .sort({ average_rating: -1 })
      .limit(limit)
      .lean();
    const data = await populateRelatedData(games, POPULATE_CONFIG);

    return { data };
  } catch (error) {
    throw new Error(`Failed to fetch top games by category: ${error}`);
  }
};

export const getTopGamesByMechanic = async (
  limit: number = 10,
  mechanic_id: number,
): Promise<GamesResult> => {
  try {
    const games = await Game.find({ mechanic_ids: mechanic_id })
      .sort({ average_rating: -1 })
      .limit(limit)
      .lean();
    const data = await populateRelatedData(games, POPULATE_CONFIG);

    return { data };
  } catch (error) {
    throw new Error(`Failed to fetch top games by mechanic: ${error}`);
  }
};

export const getBestGamesForPlayers = async (
  limit: number = 10,
  requestedPlayerCount: number,
): Promise<GamesResult> => {
  try {
    const games = await Game.find({
      min_players: { $lte: requestedPlayerCount },
      max_players: { $gte: requestedPlayerCount },
    })
      .sort({ average_rating: -1 })
      .limit(limit)
      .lean();
    const data = await populateRelatedData(games, POPULATE_CONFIG);

    return { data };
  } catch (error) {
    throw new Error(
      `Failed to fetch best games for ${requestedPlayerCount} players: ${error}`,
    );
  }
};
