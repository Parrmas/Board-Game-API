import request from "supertest";
import app from "../src/app";
import Category from "../src/module/category/category.model";
import Game from "../src/module/game/game.model";

describe("GET /api/categories/popular", () => {
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

  it("ranks categories by game count, excluding empty categories", async () => {
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

    const res = await request(app).get(
      "/api/categories/popular?limit=10&page=1",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2); // "Unused" excluded
    expect(res.body.data.data[0].name).toBe("Strategy");
    expect(res.body.data.data[0].gameCount).toBe(2);
    expect(res.body.data.totalCategory).toBe(2);
  });
});
