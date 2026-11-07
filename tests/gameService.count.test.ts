import * as GameService from "../src/module/game/game.service";
import Game from "../src/module/game/game.model";

describe("GameService.count", () => {
  const createGame = (bgg_id: number, name: string) =>
    Game.create({
      _id: `g${bgg_id}`,
      bgg_id,
      name,
      description: "A board game",
      year_published: 2000,
      min_players: 2,
      max_players: 4,
      playing_time: 60,
      min_playtime: 30,
      max_playtime: 60,
      min_age: 8,
      image_url: "image",
      thumbnail_url: "thumbnail",
      average_rating: 7,
      complexity_weight: 2,
    });

  it("counts all games when no filters are provided", async () => {
    await createGame(1, "Catan");
    await createGame(2, "Chess");

    await expect(GameService.count({})).resolves.toEqual({ total: 2 });
  });

  it("counts games matching filters", async () => {
    await Game.create([
      {
        _id: "g1",
        bgg_id: 1,
        name: "Catan",
        description: "A board game",
        year_published: 2000,
        min_players: 2,
        max_players: 4,
        playing_time: 60,
        min_playtime: 30,
        max_playtime: 60,
        min_age: 8,
        image_url: "image",
        thumbnail_url: "thumbnail",
        average_rating: 8,
        complexity_weight: 2,
      },
      {
        _id: "g2",
        bgg_id: 2,
        name: "Chess",
        description: "A board game",
        year_published: 2000,
        min_players: 2,
        max_players: 4,
        playing_time: 60,
        min_playtime: 30,
        max_playtime: 60,
        min_age: 8,
        image_url: "image",
        thumbnail_url: "thumbnail",
        average_rating: 7,
        complexity_weight: 2,
      },
    ]);

    await expect(GameService.count({ min_rating: 8 })).resolves.toEqual({
      total: 1,
    });
  });

  it("applies the name filter", async () => {
    await createGame(1, "Catan");
    await createGame(2, "Chess");

    await expect(GameService.count({ name: "cat" })).resolves.toEqual({
      total: 1,
    });
  });

  it("returns zero for an empty collection", async () => {
    await expect(GameService.count({})).resolves.toEqual({ total: 0 });
  });
});
