import Game from "../src/module/game/game.model";
import * as FilterUtil from "../src/utils/filter.util";
import app from "../src/app";
import request from "supertest";
import { callMcp } from "./helpers/mcpClient";

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

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /api/mcp", () => {
  it("initializes the board game API MCP server", async () => {
    const res = await callMcp("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" },
    });

    expect(res.body.result.serverInfo.name).toBe("board-game-api");
  });

  it("lists get_filter_options", async () => {
    const res = await callMcp("tools/list");
    expect(
      res.body.result.tools.map((tool: { name: string }) => tool.name),
    ).toContain("get_filter_options");
  });

  it("returns zeroed ranges for an empty database", async () => {
    const res = await callMcp("tools/call", { name: "get_filter_options" });
    expect(JSON.parse(res.body.result.content[0].text)).toEqual({
      players: { min: 0, max: 0 },
      playtime: { min: 0, max: 0 },
      rating: { min: 0, max: 0 },
      complexity: { min: 0, max: 0 },
    });
  });

  it("returns ranges from the game collection", async () => {
    await Game.create({ _id: "g1", ...baseGame });
    const res = await callMcp("tools/call", { name: "get_filter_options" });
    expect(JSON.parse(res.body.result.content[0].text)).toEqual({
      players: { min: 3, max: 4 },
      playtime: { min: 60, max: 90 },
      rating: { min: 7.2, max: 7.2 },
      complexity: { min: 2.3, max: 2.3 },
    });
  });

  it("reports an unknown tool as a JSON-RPC error or tool error", async () => {
    const res = await callMcp("tools/call", { name: "nope" });
    expect(res.status).not.toBe(500);
    if (res.body.error) {
      expect(res.body.jsonrpc).toBe("2.0");
    } else {
      expect(res.body.result.isError).toBe(true);
      // SDK returns unknown-tool errors as tool results in this version.
      console.info("SDK unknown tool response:", res.body.result.content);
    }
  });

  it("handles JSON request bodies", async () => {
    const res = await callMcp("tools/list");
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

  it("hides unexpected tool errors", async () => {
    jest
      .spyOn(FilterUtil, "getFilterOptions")
      .mockRejectedValue(new Error("raw db"));
    const res = await callMcp("tools/call", { name: "get_filter_options" });
    expect(res.body.result.isError).toBe(true);
    expect(res.body.result.content[0].text).toBe("Internal server error");
    expect(res.body.result.content[0].text).not.toContain("raw db");
  });
});

describe.each(["get", "delete"])("%s /api/mcp", (method) => {
  it("returns a JSON-RPC method not allowed error", async () => {
    const res = await request(app)[method as "get" | "delete"]("/api/mcp");
    expect(res.status).toBe(405);
    expect(res.body.jsonrpc).toBe("2.0");
    expect(res.body.error).toBeDefined();
    expect(res.body.message).toBeUndefined();
  });
});
