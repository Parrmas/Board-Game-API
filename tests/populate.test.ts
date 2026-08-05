import request from "supertest";
import app from "../src/app";
import Game from "../src/module/game/game.model";

const makeGame = (overrides: Partial<Record<string, unknown>>) => ({
  description: "d",
  image_url: "u",
  thumbnail_url: "u",
  ...overrides,
});

describe("GET /api/stats/overall", () => {
  it("aggregates summary, player, playtime, and year breakdowns", async () => {
    await Game.create([
      makeGame({
        _id: "g1",
        bgg_id: 1,
        name: "A",
        year_published: 2000,
        min_players: 2,
        max_players: 4,
        playing_time: 45,
        min_playtime: 30,
        max_playtime: 45,
        min_age: 8,
        average_rating: 6,
        complexity_weight: 2,
        category_ids: [1],
      }),
      makeGame({
        _id: "g2",
        bgg_id: 2,
        name: "B",
        year_published: 2010,
        min_players: 1,
        max_players: 2,
        playing_time: 20,
        min_playtime: 10,
        max_playtime: 20,
        min_age: 6,
        average_rating: 8,
        complexity_weight: 3,
        category_ids: [1, 2],
      }),
    ]);

    const res = await request(app).get("/api/stats/overall");

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalGames).toBe(2);
    expect(res.body.data.summary.totalCategories).toBe(2);
    expect(res.body.data.summary.averageRating).toBe(7);
    expect(res.body.data.byYear).toEqual(
      expect.arrayContaining([
        { year: 2000, gameCount: 1 },
        { year: 2010, gameCount: 1 },
      ]),
    );
  });
});

describe("GET /api/stats/top-rated", () => {
  it("returns games sorted by rating descending", async () => {
    await Game.create([
      makeGame({
        _id: "g1",
        bgg_id: 1,
        name: "Low",
        year_published: 2000,
        min_players: 2,
        max_players: 4,
        playing_time: 30,
        min_playtime: 20,
        max_playtime: 30,
        min_age: 8,
        average_rating: 4,
        complexity_weight: 1,
      }),
      makeGame({
        _id: "g2",
        bgg_id: 2,
        name: "High",
        year_published: 2000,
        min_players: 2,
        max_players: 4,
        playing_time: 30,
        min_playtime: 20,
        max_playtime: 30,
        min_age: 8,
        average_rating: 9,
        complexity_weight: 1,
      }),
    ]);

    const res = await request(app).get("/api/stats/top-rated?limit=1");
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].name).toBe("High");
  });
});

describe("GET /api/stats/best-for-players/:player_count", () => {
  it("returns games that support the requested player count", async () => {
    await Game.create([
      makeGame({
        _id: "g1",
        bgg_id: 1,
        name: "Fits",
        year_published: 2000,
        min_players: 2,
        max_players: 4,
        playing_time: 30,
        min_playtime: 20,
        max_playtime: 30,
        min_age: 8,
        average_rating: 5,
        complexity_weight: 1,
      }),
      makeGame({
        _id: "g2",
        bgg_id: 2,
        name: "TooBig",
        year_published: 2000,
        min_players: 6,
        max_players: 8,
        playing_time: 30,
        min_playtime: 20,
        max_playtime: 30,
        min_age: 8,
        average_rating: 5,
        complexity_weight: 1,
      }),
    ]);

    const res = await request(app).get(
      "/api/stats/best-for-players/3?limit=10",
    );
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].name).toBe("Fits");
  });

  it("rejects a non-numeric player_count", async () => {
    const res = await request(app).get("/api/stats/best-for-players/abc");
    expect(res.status).toBe(400);
  });
});
