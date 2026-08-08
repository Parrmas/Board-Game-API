import {
  buildFilterForOverall,
  getFilterOptions,
} from "../src/utils/filter.util";
import Game from "../src/module/game/game.model";

describe("buildFilterForOverall additional branches", () => {
  it("builds a playtime range filter", () => {
    const query = buildFilterForOverall({ min_playtime: 30, max_playtime: 90 });
    expect(query.playing_time).toEqual({ $gte: 30, $lte: 90 });
  });

  it("builds a rating range filter", () => {
    const query = buildFilterForOverall({ min_rating: 5, max_rating: 8 });
    expect(query.average_rating).toEqual({ $gte: 5, $lte: 8 });
  });

  it("builds a complexity range filter", () => {
    const query = buildFilterForOverall({
      min_complexity: 1,
      max_complexity: 3,
    });
    expect(query.complexity_weight).toEqual({ $gte: 1, $lte: 3 });
  });

  it("builds array filters for categories/mechanics/designers/publishers", () => {
    const query = buildFilterForOverall({
      categories: [1, 2],
      mechanics: [3],
      designers: [4],
      publishers: [5],
    });
    expect(query.category_ids).toEqual({ $in: [1, 2] });
    expect(query.mechanic_ids).toEqual({ $in: [3] });
    expect(query.designer_ids).toEqual({ $in: [4] });
    expect(query.publisher_ids).toEqual({ $in: [5] });
  });

  it("returns an empty query object when no filters are provided", () => {
    const query = buildFilterForOverall({});
    expect(query).toEqual({});
  });

  it("only applies max_players side of the player-count filter when min is omitted", () => {
    const query = buildFilterForOverall({ max_players: 4 });
    expect(query.$and).toEqual([{ min_players: { $lte: 4 } }]);
  });

  it("only applies min_players side of the player-count filter when max is omitted", () => {
    const query = buildFilterForOverall({ min_players: 2 });
    expect(query.$and).toEqual([{ max_players: { $gte: 2 } }]);
  });
});

describe("getFilterOptions", () => {
  it("returns zeroed ranges when the collection is empty", async () => {
    const result = await getFilterOptions();
    expect(result).toEqual({
      players: { min: 0, max: 0 },
      playtime: { min: 0, max: 0 },
      rating: { min: 0, max: 0 },
      complexity: { min: 0, max: 0 },
    });
  });

  it("computes correct min/max across multiple games", async () => {
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

    const result = await getFilterOptions();
    expect(result.players).toEqual({ min: 1, max: 8 });
    expect(result.playtime).toEqual({ min: 15, max: 150 });
    expect(result.rating).toEqual({ min: 5, max: 9 });
    expect(result.complexity).toEqual({ min: 1, max: 4 });
  });
});
