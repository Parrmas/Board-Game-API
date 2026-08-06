import request from "supertest";
import app from "../src/app";
import Game from "../src/module/game/game.model";
import Category from "../src/module/category/category.model";

describe("GET /api/games/list", () => {
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

  it("returns paginated games with populated related data", async () => {
    await Category.create({ _id: "c1", bgg_id: 100, name: "Strategy" });
    await Game.create({
      _id: "g1",
      ...baseGame,
      category_ids: [100],
    });

    const res = await request(app).get("/api/games/list?limit=10&page=1");

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].categories[0].name).toBe("Strategy");
    expect(res.body.data.data[0].category_ids).toBeUndefined();
  });

  it("filters by player count overlap", async () => {
    await Game.create([
      { _id: "g1", ...baseGame, bgg_id: 1, min_players: 2, max_players: 4 },
      { _id: "g2", ...baseGame, bgg_id: 2, min_players: 5, max_players: 8 },
    ]);

    const res = await request(app).get(
      "/api/games/list?min_players=3&max_players=4",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].bgg_id).toBe(1);
  });

  it("filters by name (case-insensitive)", async () => {
    await Game.create({ _id: "g1", ...baseGame, name: "Catan" });
    const res = await request(app).get("/api/games/list?name=catan");
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
  });

  it("rejects an invalid rating range", async () => {
    const res = await request(app).get(
      "/api/games/list?min_rating=8&max_rating=2",
    );
    expect(res.status).toBe(400);
  });

  it("rejects a limit above the max", async () => {
    const res = await request(app).get("/api/games/list?limit=999");
    expect(res.status).toBe(400);
  });

  it("rejects when min_players is greater than max_players", async () => {
    const res = await request(app).get(
      "/api/games/list?min_players=6&max_players=2",
    );
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/min_players/);
  });
});

describe("GET /api/games/get/:bgg_id", () => {
  it("returns games matching the given bgg_ids", async () => {
    await Game.create([
      {
        _id: "g1",
        bgg_id: 1,
        name: "Catan",
        description: "d",
        year_published: 1995,
        min_players: 3,
        max_players: 4,
        playing_time: 90,
        min_playtime: 60,
        max_playtime: 90,
        min_age: 10,
        image_url: "u",
        thumbnail_url: "u",
        average_rating: 7,
        complexity_weight: 2,
      },
      {
        _id: "g2",
        bgg_id: 2,
        name: "Chess",
        description: "d",
        year_published: 1475,
        min_players: 2,
        max_players: 2,
        playing_time: 30,
        min_playtime: 10,
        max_playtime: 30,
        min_age: 6,
        image_url: "u",
        thumbnail_url: "u",
        average_rating: 8,
        complexity_weight: 3,
      },
    ]);

    const res = await request(app).get("/api/games/get/1,2");
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
  });

  it("rejects a malformed bgg_id", async () => {
    const res = await request(app).get("/api/games/get/abc");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/games/filter-options", () => {
  it("returns min/max ranges across the collection", async () => {
    await Game.create([
      {
        _id: "g1",
        bgg_id: 1,
        name: "A",
        description: "d",
        year_published: 2000,
        min_players: 1,
        max_players: 4,
        playing_time: 30,
        min_playtime: 15,
        max_playtime: 45,
        min_age: 8,
        image_url: "u",
        thumbnail_url: "u",
        average_rating: 5,
        complexity_weight: 1,
      },
      {
        _id: "g2",
        bgg_id: 2,
        name: "B",
        description: "d",
        year_published: 2010,
        min_players: 2,
        max_players: 8,
        playing_time: 120,
        min_playtime: 60,
        max_playtime: 150,
        min_age: 12,
        image_url: "u",
        thumbnail_url: "u",
        average_rating: 9,
        complexity_weight: 4,
      },
    ]);

    const res = await request(app).get("/api/games/filter-options");
    expect(res.status).toBe(200);
    expect(res.body.data.players).toEqual({ min: 1, max: 8 });
    expect(res.body.data.rating).toEqual({ min: 5, max: 9 });
  });
});
