import Game from "../models/game.model";
import { OverallStats } from "../types/stats.type";

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
