import request from "supertest";
import app from "../src/app";
import { testControllerErrorBranches } from "./helpers/controllerErrors";

import * as StatsService from "../src/module/stats/stats.service";
import * as FilterUtil from "../src/utils/filter.util";

// --- HTTP-layer error branch tests ---
// Only valid for controllers that call the service through the module
// namespace at call time. Factory-built controllers (mechanic, publisher,
// designer, game.get) close over the service function at import time and
// can't be intercepted this way — their factory error-handling is already
// covered generically in crudFactories.test.ts.

testControllerErrorBranches(app, {
  label: "GET /api/stats/most-complex",
  method: "get",
  url: "/api/stats/most-complex?limit=5",
  getSpy: () => jest.spyOn(StatsService, "getMostComplexGames"),
});

describe("GET /api/games/filter-options error handling", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 500 with its own message for an unexpected error", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest
      .spyOn(FilterUtil, "getFilterOptions")
      .mockRejectedValueOnce(new Error("raw internal db error"));

    const res = await request(app).get("/api/games/filter-options");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: "Failed to fetch filter options",
    });
    expect(JSON.stringify(res.body)).not.toContain("raw internal db error");

    consoleSpy.mockRestore();
  });
});
