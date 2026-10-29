import * as GameService from "../src/module/game/game.service";
import Game from "../src/module/game/game.model";
import Category from "../src/module/category/category.model";
import { AppError } from "../src/utils/appError.util";
import { callTool } from "./helpers/mcpClient";

const baseGame = {
  bgg_id: 1,
  name: "Catan",
  description: "Trade and build",
  year_published: 1995,
  min_players: 3,
  max_players: 4,
  playing_time: 90,
  min_playtime: 60,
  max_playtime: 90,
  min_age: 10,
  image_url: "http://example.com/a.jpg",
  thumbnail_url: "http://example.com/a-thumb.jpg",
  average_rating: 7.2,
  complexity_weight: 2.3,
};

const getToolResult = (response: { body: any }): any => response.body.result;

const getData = (response: { body: any }): any[] =>
  JSON.parse(getToolResult(response).content[0].text).data;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("search_games", () => {
  it("returns matching games with populated categories and no description", async () => {
    await Category.create({ _id: "c1", bgg_id: 100, name: "Strategy" });
    await Game.create({ _id: "g1", ...baseGame, category_ids: [100] });

    const result = getToolResult(
      await callTool("search_games", { name: "catan" }),
    );
    const data = JSON.parse(result.content[0].text).data;

    expect(result.isError).toBeUndefined();
    expect(data[0].name).toBe("Catan");
    expect(data[0].description).toBeUndefined();
    expect(data[0].categories[0].name).toBe("Strategy");
    expect(data[0].category_ids).toBeUndefined();
  });

  it("filters players by range overlap", async () => {
    await Game.create([
      { _id: "g1", ...baseGame, bgg_id: 1, min_players: 2, max_players: 4 },
      { _id: "g2", ...baseGame, bgg_id: 2, min_players: 5, max_players: 8 },
    ]);

    const data = getData(
      await callTool("search_games", { min_players: 3, max_players: 4 }),
    );

    expect(data).toHaveLength(1);
    expect(data[0].bgg_id).toBe(1);
  });

  it("rejects reversed player ranges without calling the service", async () => {
    const listSpy = jest.spyOn(GameService, "list");
    const result = getToolResult(
      await callTool("search_games", { min_players: 6, max_players: 2 }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/min_players/);
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("rejects reversed rating ranges without calling the service", async () => {
    const listSpy = jest.spyOn(GameService, "list");
    const result = getToolResult(
      await callTool("search_games", { min_rating: 8, max_rating: 2 }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/min_rating/);
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("returns an empty data array when there are no matches", async () => {
    const data = getData(await callTool("search_games", { name: "zzz" }));
    expect(data).toEqual([]);
  });

  it("rejects a limit above the maximum", async () => {
    const result = getToolResult(
      await callTool("search_games", { limit: 999 }),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/limit/);
  });

  it("passes the requested limit and default page to the service", async () => {
    const listSpy = jest.spyOn(GameService, "list");
    await callTool("search_games", { limit: 5 });
    expect(listSpy).toHaveBeenCalledWith(5, 1, expect.any(Object));
  });

  it("uses default limit and page when omitted", async () => {
    const listSpy = jest.spyOn(GameService, "list");
    await callTool("search_games");
    expect(listSpy).toHaveBeenCalledWith(10, 1, expect.any(Object));
  });

  it("filters by category ids", async () => {
    await Game.create([
      { _id: "g1", ...baseGame, bgg_id: 1, category_ids: [100] },
      { _id: "g2", ...baseGame, bgg_id: 2, category_ids: [200] },
    ]);

    const data = getData(await callTool("search_games", { categories: [100] }));
    expect(data.map((game) => game.bgg_id)).toEqual([1]);
  });

  it("returns tool errors for service failures without exposing raw errors", async () => {
    jest
      .spyOn(GameService, "list")
      .mockRejectedValueOnce(new AppError("x", 422));
    const appErrorResult = getToolResult(await callTool("search_games"));
    expect(appErrorResult.isError).toBe(true);
    expect(appErrorResult.content[0].text).toBe("x");

    jest.spyOn(GameService, "list").mockRejectedValueOnce(new Error("raw db"));
    const rawErrorResult = getToolResult(await callTool("search_games"));
    expect(rawErrorResult.isError).toBe(true);
    expect(rawErrorResult.content[0].text).toBe("Internal server error");
    expect(rawErrorResult.content[0].text).not.toContain("raw db");
  });
});

describe("get_games", () => {
  it("returns requested games without descriptions", async () => {
    await Game.create([
      { _id: "g1", ...baseGame, bgg_id: 1 },
      { _id: "g2", ...baseGame, bgg_id: 2, name: "Chess" },
    ]);

    const data = getData(await callTool("get_games", { bgg_ids: [1, 2] }));
    expect(data).toHaveLength(2);
    expect(data.every((game) => game.description === undefined)).toBe(true);
  });

  it("returns an empty data array when ids do not match", async () => {
    expect(getData(await callTool("get_games", { bgg_ids: [9999] }))).toEqual(
      [],
    );
  });

  it("rejects more than 50 ids", async () => {
    const result = getToolResult(
      await callTool("get_games", {
        bgg_ids: Array.from({ length: 51 }, (_, i) => i),
      }),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/bgg_ids/);
  });

  it("rejects an empty id list", async () => {
    const result = getToolResult(await callTool("get_games", { bgg_ids: [] }));
    expect(result.isError).toBe(true);
  });
});
