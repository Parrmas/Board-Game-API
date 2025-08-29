import Game, { IGame } from "../models/game.model";

interface GamesResult {
  data: IGame[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const list = async (
  limit: number = 10,
  page: number = 1,
): Promise<GamesResult> => {
  try {
    const skip = (page - 1) * limit;
    const data = await Game.find().limit(limit).skip(skip).sort({ name: 1 });
    const total = await Game.countDocuments();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching games: ${error}`);
  }
};
