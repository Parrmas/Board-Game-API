import * as CategoryService from "../src/module/category/category.service";
import Category from "../src/module/category/category.model";
import * as DesignerService from "../src/module/designer/designer.service";
import Designer from "../src/module/designer/designer.model";
import * as MechanicService from "../src/module/mechanic/mechanic.service";
import Mechanic from "../src/module/mechanic/mechanic.model";
import * as PublisherService from "../src/module/publisher/publisher.service";
import Publisher from "../src/module/publisher/publisher.model";
import Game from "../src/module/game/game.model";
import { AppError } from "../src/utils/appError.util";
import { callMcp, callTool } from "./helpers/mcpClient";

const getToolResult = (response: { body: any }): any => response.body.result;

const getData = (response: { body: any }): any =>
  JSON.parse(getToolResult(response).content[0].text);

const getErrorText = (response: { body: any }): string =>
  getToolResult(response).content[0].text;

const gameFields = {
  description: "d",
  year_published: 2000,
  min_players: 2,
  max_players: 4,
  playing_time: 60,
  min_playtime: 30,
  max_playtime: 60,
  min_age: 10,
  image_url: "u",
  thumbnail_url: "u",
  average_rating: 7,
  complexity_weight: 2,
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("get_popular_categories", () => {
  it("ranks by game count and excludes categories without games", async () => {
    await Category.create([
      { _id: "c1", bgg_id: 1, name: "Strategy" },
      { _id: "c2", bgg_id: 2, name: "Party" },
      { _id: "c3", bgg_id: 3, name: "Unused" },
    ]);
    await Game.create([
      { _id: "g1", bgg_id: 1, name: "A", ...gameFields, category_ids: [1] },
      { _id: "g2", bgg_id: 2, name: "B", ...gameFields, category_ids: [1] },
      { _id: "g3", bgg_id: 3, name: "C", ...gameFields, category_ids: [2] },
    ]);

    const result = getData(await callTool("get_popular_categories"));
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe("Strategy");
    expect(result.data[0].gameCount).toBe(2);
    expect(result.totalCategory).toBe(2);
  });

  it("returns the second ranked category for page two", async () => {
    await Category.create([
      { _id: "c1", bgg_id: 1, name: "Strategy" },
      { _id: "c2", bgg_id: 2, name: "Party" },
    ]);
    await Game.create([
      { _id: "g1", bgg_id: 1, name: "A", ...gameFields, category_ids: [1] },
      { _id: "g2", bgg_id: 2, name: "B", ...gameFields, category_ids: [1] },
      { _id: "g3", bgg_id: 3, name: "C", ...gameFields, category_ids: [2] },
    ]);

    const result = getData(
      await callTool("get_popular_categories", { limit: 1, page: 2 }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Party");
  });

  it("rejects limits above the maximum", async () => {
    const result = getToolResult(
      await callTool("get_popular_categories", { limit: 999 }),
    );
    expect(result.isError).toBe(true);
    expect(getErrorText({ body: { result } })).toMatch(/limit/);
  });

  it("maps service errors safely", async () => {
    jest
      .spyOn(CategoryService, "getPopular")
      .mockRejectedValueOnce(new AppError("x", 422));
    const knownError = getToolResult(await callTool("get_popular_categories"));
    expect(knownError.isError).toBe(true);
    expect(knownError.content[0].text).toBe("x");

    jest
      .spyOn(CategoryService, "getPopular")
      .mockRejectedValueOnce(new Error("raw db"));
    const rawError = getToolResult(await callTool("get_popular_categories"));
    expect(rawError.isError).toBe(true);
    expect(rawError.content[0].text).toBe("Internal server error");
    expect(rawError.content[0].text).not.toContain("raw db");
  });
});

describe("list_reference_data", () => {
  it("pages mechanics alphabetically", async () => {
    await Mechanic.create([
      { _id: "m1", bgg_id: 1, name: "Worker Placement" },
      { _id: "m2", bgg_id: 2, name: "Deck Building" },
    ]);
    const first = getData(
      await callTool("list_reference_data", { type: "mechanic" }),
    );
    const second = getData(
      await callTool("list_reference_data", {
        type: "mechanic",
        limit: 1,
        page: 2,
      }),
    );
    expect(first.data[0].name).toBe("Deck Building");
    expect(second.data[0].name).toBe("Worker Placement");
  });

  it("matches names partially without case sensitivity", async () => {
    await Designer.create([
      { _id: "d1", bgg_id: 1, name: "Klaus Teuber" },
      { _id: "d2", bgg_id: 2, name: "Reiner Knizia" },
    ]);
    const result = getData(
      await callTool("list_reference_data", {
        type: "designer",
        name: "knizia",
      }),
    );
    expect(result.data.map((entry: any) => entry.name)).toEqual([
      "Reiner Knizia",
    ]);
  });

  it("treats regex characters in names literally", async () => {
    await Designer.create([
      { _id: "d1", bgg_id: 1, name: "A.B" },
      { _id: "d2", bgg_id: 2, name: "AxB" },
    ]);
    const result = getData(
      await callTool("list_reference_data", { type: "designer", name: "A.B" }),
    );
    expect(result.data.map((entry: any) => entry.name)).toEqual(["A.B"]);
  });

  it("validates name length and rejects blank names", async () => {
    const blank = getToolResult(
      await callTool("list_reference_data", { type: "designer", name: "" }),
    );
    expect(blank.isError).toBe(true);
    expect(getErrorText({ body: { result: blank } })).toMatch(/name/);
    const tooLong = getToolResult(
      await callTool("list_reference_data", {
        type: "designer",
        name: "x".repeat(101),
      }),
    );
    expect(tooLong.isError).toBe(true);
    const valid = getToolResult(
      await callTool("list_reference_data", {
        type: "designer",
        name: "x".repeat(100),
      }),
    );
    expect(valid.isError).toBeUndefined();
  });

  it("dispatches category and publisher calls with the REST argument shape", async () => {
    const categorySpy = jest.spyOn(CategoryService, "list");
    const publisherSpy = jest.spyOn(PublisherService, "list");
    await Category.create({ _id: "c1", bgg_id: 1, name: "Area" });
    await Publisher.create({ _id: "p1", bgg_id: 2, name: "Zed" });
    const categories = getData(
      await callTool("list_reference_data", { type: "category" }),
    );
    const publishers = getData(
      await callTool("list_reference_data", { type: "publisher" }),
    );
    expect(categories.data.map((entry: any) => entry.name)).toContain("Area");
    expect(publishers.data.map((entry: any) => entry.name)).toContain("Zed");
    expect(categorySpy).toHaveBeenCalledWith(10, 1);
    expect(categorySpy.mock.calls[0]).toHaveLength(2);
    await callTool("list_reference_data", {
      type: "category",
      name: "x",
    });
    expect(categorySpy).toHaveBeenLastCalledWith(10, 1, "x");
    expect(publisherSpy).toHaveBeenCalledWith(10, 1);
    expect(publisherSpy.mock.calls[0]).toHaveLength(2);

    await callTool("list_reference_data", {
      type: "publisher",
      name: "x",
    });
    expect(publisherSpy).toHaveBeenLastCalledWith(10, 1, "x");
  });

  it("rejects invalid types and limits", async () => {
    for (const args of [{ type: "game" }, { type: "mechanic", limit: 999 }]) {
      const result = getToolResult(await callTool("list_reference_data", args));
      expect(result.isError).toBe(true);
      expect(getErrorText({ body: { result } })).toMatch(
        args.type === "game" ? /type/ : /limit/,
      );
    }
  });

  it("maps mechanic service errors safely", async () => {
    jest
      .spyOn(MechanicService, "list")
      .mockRejectedValueOnce(new AppError("x", 422));
    const knownError = getToolResult(
      await callTool("list_reference_data", { type: "mechanic" }),
    );
    expect(knownError.isError).toBe(true);
    expect(knownError.content[0].text).toBe("x");
    jest
      .spyOn(MechanicService, "list")
      .mockRejectedValueOnce(new Error("raw db"));
    const rawError = getToolResult(
      await callTool("list_reference_data", { type: "mechanic" }),
    );
    expect(rawError.isError).toBe(true);
    expect(rawError.content[0].text).toBe("Internal server error");
    expect(rawError.content[0].text).not.toContain("raw db");
  });
});

describe("get_reference_data", () => {
  it("returns matching designers and empty results for missing publishers", async () => {
    await Designer.create({ _id: "d1", bgg_id: 7, name: "Reiner Knizia" });
    await Publisher.create({ _id: "p1", bgg_id: 8, name: "Zed" });
    const designer = getData(
      await callTool("get_reference_data", {
        type: "designer",
        bgg_ids: [7],
      }),
    );
    const publisher = getData(
      await callTool("get_reference_data", {
        type: "publisher",
        bgg_ids: [9999],
      }),
    );
    expect(designer.data[0].name).toBe("Reiner Knizia");
    expect(publisher.data).toEqual([]);
  });

  it("rejects invalid types and id array sizes", async () => {
    const invalidType = getToolResult(
      await callTool("get_reference_data", { type: "game", bgg_ids: [1] }),
    );
    expect(invalidType.isError).toBe(true);
    expect(getErrorText({ body: { result: invalidType } })).toMatch(/type/);
    for (const bgg_ids of [Array.from({ length: 51 }, (_, i) => i), []]) {
      const result = getToolResult(
        await callTool("get_reference_data", { type: "category", bgg_ids }),
      );
      expect(result.isError).toBe(true);
      if (bgg_ids.length === 51) {
        expect(getErrorText({ body: { result } })).toMatch(/bgg_ids/);
      }
    }
  });
});

it("documents reference lookup from game tools", async () => {
  const response = await callMcp("tools/list");
  const descriptions = Object.fromEntries(
    response.body.result.tools.map((tool: any) => [
      tool.name,
      tool.description,
    ]),
  );
  for (const name of ["search_games", "get_games"]) {
    expect(descriptions[name]).toContain("list_reference_data");
    expect(descriptions[name]).not.toContain("once that tool");
  }
});
