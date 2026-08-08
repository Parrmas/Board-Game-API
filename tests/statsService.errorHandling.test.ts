import * as StatsService from "../src/module/stats/stats.service";
import Game from "../src/module/game/game.model";
import { AppError } from "../src/utils/appError.util";

describe("StatsService error handling", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("getTopRatedGames wraps DB errors in an AppError with status 500", async () => {
    jest.spyOn(Game, "find").mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(StatsService.getTopRatedGames(10)).rejects.toThrow(AppError);
    await expect(StatsService.getTopRatedGames(10)).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("getMostComplexGames wraps DB errors in an AppError with status 500", async () => {
    jest.spyOn(Game, "find").mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(StatsService.getMostComplexGames(10)).rejects.toThrow(
      AppError,
    );
    await expect(StatsService.getMostComplexGames(10)).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("getBestGamesForPlayers wraps DB errors in an AppError with status 500", async () => {
    jest.spyOn(Game, "find").mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(StatsService.getBestGamesForPlayers(10, 4)).rejects.toThrow(
      AppError,
    );
    await expect(
      StatsService.getBestGamesForPlayers(10, 4),
    ).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("getOverallStats wraps aggregation errors in an AppError with status 500", async () => {
    jest.spyOn(Game, "aggregate").mockImplementation(() => {
      throw new Error("aggregation failed");
    });

    await expect(StatsService.getOverallStats()).rejects.toThrow(AppError);
    await expect(StatsService.getOverallStats()).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
