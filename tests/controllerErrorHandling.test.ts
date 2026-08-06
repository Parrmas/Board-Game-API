import app from "../src/app";
import { testControllerErrorBranches } from "./helpers/controllerErrors";

import * as CategoryService from "../src/module/category/category.service";
import * as GameService from "../src/module/game/game.service";
import * as StatsService from "../src/module/stats/stats.service";
import * as AuthService from "../src/module/auth/auth.service";

testControllerErrorBranches(app, {
  label: "GET /api/categories/popular",
  method: "get",
  url: "/api/categories/popular?limit=10&page=1",
  getSpy: () => jest.spyOn(CategoryService, "getPopular"),
});

testControllerErrorBranches(app, {
  label: "GET /api/games/list",
  method: "get",
  url: "/api/games/list?limit=10&page=1",
  getSpy: () => jest.spyOn(GameService, "list"),
});

testControllerErrorBranches(app, {
  label: "GET /api/stats/overall",
  method: "get",
  url: "/api/stats/overall",
  getSpy: () => jest.spyOn(StatsService, "getOverallStats"),
});

testControllerErrorBranches(app, {
  label: "GET /api/stats/top-rated",
  method: "get",
  url: "/api/stats/top-rated?limit=5",
  getSpy: () => jest.spyOn(StatsService, "getTopRatedGames"),
});

testControllerErrorBranches(app, {
  label: "GET /api/stats/best-for-players/:player_count",
  method: "get",
  url: "/api/stats/best-for-players/4?limit=5",
  getSpy: () => jest.spyOn(StatsService, "getBestGamesForPlayers"),
});

// --- Auth (needs a valid token first, so handled separately below) ---
describe("Auth controller error handling", () => {
  const user = {
    email: "erroruser@example.com",
    password: "password123",
    username: "erroruser",
    firstName: "Err",
    lastName: "User",
  };

  let token: string;

  beforeEach(async () => {
    const request = (await import("supertest")).default;
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    token = loginRes.body.data.token;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  testControllerErrorBranches(app, {
    label: "GET /api/auth/user",
    method: "get",
    url: "/api/auth/user",
    getSpy: () => jest.spyOn(AuthService, "getUserById"),
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });
});
