import * as StatsService from "../src/module/stats/stats.service";
import Game from "../src/module/game/game.model";
import Category from "../src/module/category/category.model";
import { AppError } from "../src/utils/appError.util";
import { callTool } from "./helpers/mcpClient";

const makeGame = (overrides: Partial<Record<string, unknown>>) => ({
  bgg_id: 1,
  name: "Game",
  description: "Game description",
  year_published: 2000,
  min_players: 2,
  max_players: 4,
  playing_time: 30,
  min_playtime: 20,
  max_playtime: 30,
  min_age: 8,
  image_url: "http://example.com/game.jpg",
  thumbnail_url: "http://example.com/thumb.jpg",
  average_rating: 5,
  complexity_weight: 1,
  ...overrides,
});

const getToolResult = (response: { body: any }): any => response.body.result;

const getData = (response: { body: any }): any[] =>
  JSON.parse(getToolResult(response).content[0].text).data;

const seedGame = (overrides: Partial<Record<string, unknown>>) =>
  Game.create(
    makeGame({
      _id: "g1",
      bgg_id: 1,
      name: "Game",
      year_published: 2000,
      min_players: 2,
      max_players: 4,
      playing_time: 30,
      min_playtime: 20,
      max_playtime: 30,
      min_age: 8,
      average_rating: 5,
      complexity_weight: 1,
      ...overrides,
    }),
  );

afterEach(() => {
  jest.restoreAllMocks();
});

describe("get_top_rated_games", () => {
  it("returns the highest-rated game within the requested limit", async () => {
    await Game.create([
      makeGame({ _id: "g1", bgg_id: 1, name: "Low", average_rating: 4 }),
      makeGame({ _id: "g2", bgg_id: 2, name: "High", average_rating: 9 }),
    ]);

    const data = getData(await callTool("get_top_rated_games", { limit: 1 }));

    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("High");
  });

  it("uses the default limit of 10", async () => {
    const statsSpy = jest.spyOn(StatsService, "getTopRatedGames");

    await callTool("get_top_rated_games");

    expect(statsSpy).toHaveBeenCalledWith(10);
  });

  it("rejects a limit above 50", async () => {
    const result = getToolResult(
      await callTool("get_top_rated_games", { limit: 999 }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/limit/);
  });

  it("returns no results when the collection is empty", async () => {
    expect(getData(await callTool("get_top_rated_games"))).toEqual([]);
  });

  it("omits descriptions and populates seeded categories", async () => {
    await Category.create({ _id: "c1", bgg_id: 100, name: "Strategy" });
    await seedGame({ category_ids: [100] });

    const data = getData(await callTool("get_top_rated_games"));

    expect(data[0].description).toBeUndefined();
    expect(data[0].categories[0].name).toBe("Strategy");
  });

  it("returns safe errors for service failures", async () => {
    jest
      .spyOn(StatsService, "getTopRatedGames")
      .mockRejectedValueOnce(new AppError("x", 422));
    const appErrorResult = getToolResult(await callTool("get_top_rated_games"));
    expect(appErrorResult.isError).toBe(true);
    expect(appErrorResult.content[0].text).toBe("x");

    jest
      .spyOn(StatsService, "getTopRatedGames")
      .mockRejectedValueOnce(new Error("raw db"));
    const rawErrorResult = getToolResult(await callTool("get_top_rated_games"));
    expect(rawErrorResult.isError).toBe(true);
    expect(rawErrorResult.content[0].text).toBe("Internal server error");
    expect(rawErrorResult.content[0].text).not.toContain("raw db");
  });
});

describe("get_most_complex_games", () => {
  it("orders games by complexity descending", async () => {
    await Game.create([
      makeGame({
        _id: "g1",
        bgg_id: 1,
        name: "Simple",
        complexity_weight: 1,
      }),
      makeGame({
        _id: "g2",
        bgg_id: 2,
        name: "Complex",
        complexity_weight: 4,
      }),
    ]);

    const data = getData(await callTool("get_most_complex_games"));

    expect(data.map((game) => game.name)).toEqual(["Complex", "Simple"]);
  });

  it("returns no results when the collection is empty", async () => {
    expect(getData(await callTool("get_most_complex_games"))).toEqual([]);
  });

  it("omits descriptions and populates seeded categories", async () => {
    await Category.create({ _id: "c1", bgg_id: 100, name: "Strategy" });
    await seedGame({ category_ids: [100] });

    const data = getData(await callTool("get_most_complex_games"));

    expect(data[0].description).toBeUndefined();
    expect(data[0].categories[0].name).toBe("Strategy");
  });

  it("rejects a limit above 50", async () => {
    const result = getToolResult(
      await callTool("get_most_complex_games", { limit: 999 }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/limit/);
  });
});

describe("get_best_games_for_players", () => {
  it("returns games that support the requested player count", async () => {
    await Game.create([
      makeGame({
        _id: "g1",
        bgg_id: 1,
        name: "Fits",
        min_players: 2,
        max_players: 4,
      }),
      makeGame({
        _id: "g2",
        bgg_id: 2,
        name: "Too many",
        min_players: 6,
        max_players: 8,
      }),
    ]);

    const data = getData(
      await callTool("get_best_games_for_players", { player_count: 3 }),
    );

    expect(data.map((game) => game.name)).toEqual(["Fits"]);
  });

  it("passes limit before player count to the service", async () => {
    const statsSpy = jest.spyOn(StatsService, "getBestGamesForPlayers");

    await callTool("get_best_games_for_players", {
      player_count: 4,
      limit: 5,
    });

    expect(statsSpy).toHaveBeenCalledWith(5, 4);
  });

  it("rejects a player count of zero", async () => {
    const result = getToolResult(
      await callTool("get_best_games_for_players", { player_count: 0 }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/player_count/);
  });

  it("rejects non-integer player counts", async () => {
    const result = getToolResult(
      await callTool("get_best_games_for_players", { player_count: 2.5 }),
    );

    expect(result.isError).toBe(true);
  });

  it("rejects a limit above 50", async () => {
    const result = getToolResult(
      await callTool("get_best_games_for_players", {
        player_count: 3,
        limit: 999,
      }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/limit/);
  });

  it("returns no results when the collection is empty", async () => {
    expect(
      getData(
        await callTool("get_best_games_for_players", { player_count: 3 }),
      ),
    ).toEqual([]);
  });

  it("omits descriptions and populates seeded categories", async () => {
    await Category.create({ _id: "c1", bgg_id: 100, name: "Strategy" });
    await seedGame({ category_ids: [100] });

    const data = getData(
      await callTool("get_best_games_for_players", { player_count: 3 }),
    );

    expect(data[0].description).toBeUndefined();
    expect(data[0].categories[0].name).toBe("Strategy");
  });
});

describe("get_overall_stats", () => {
  it("returns zero totals and finite averages for an empty collection", async () => {
    const result = getToolResult(await callTool("get_overall_stats"));
    const stats = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(stats.summary.totalGames).toBe(0);
    expect(Number.isNaN(stats.summary.averageRating)).toBe(false);
    expect(Number.isNaN(stats.summary.averageComplexity)).toBe(false);
    expect(typeof stats.summary.averageRating).toBe("number");
    expect(typeof stats.summary.averageComplexity).toBe("number");
  });

  it("returns the number of games in the collection", async () => {
    await Game.create([
      makeGame({ _id: "g1", bgg_id: 1, name: "One" }),
      makeGame({ _id: "g2", bgg_id: 2, name: "Two" }),
    ]);

    const result = getToolResult(await callTool("get_overall_stats"));

    expect(JSON.parse(result.content[0].text).summary.totalGames).toBe(2);
  });

  it("returns safe errors for service failures", async () => {
    jest
      .spyOn(StatsService, "getOverallStats")
      .mockRejectedValueOnce(new AppError("x", 422));
    const appErrorResult = getToolResult(await callTool("get_overall_stats"));
    expect(appErrorResult.isError).toBe(true);
    expect(appErrorResult.content[0].text).toBe("x");

    jest
      .spyOn(StatsService, "getOverallStats")
      .mockRejectedValueOnce(new Error("raw db"));
    const rawErrorResult = getToolResult(await callTool("get_overall_stats"));
    expect(rawErrorResult.isError).toBe(true);
    expect(rawErrorResult.content[0].text).toBe("Internal server error");
    expect(rawErrorResult.content[0].text).not.toContain("raw db");
  });
});
