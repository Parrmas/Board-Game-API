import { buildFilterForOverall } from "../src/utils/filter.util";

describe("buildFilterForOverall", () => {
  it("builds correct player-count overlap filter", () => {
    const query = buildFilterForOverall({ min_players: 2, max_players: 4 });
    expect(query.$and).toContainEqual({ min_players: { $lte: 4 } });
    expect(query.$and).toContainEqual({ max_players: { $gte: 2 } });
  });

  it("escapes regex special characters in name filter", () => {
    const query = buildFilterForOverall({ name: "Catan (2nd ed.)" });
    expect(query.name.$regex).toBe("Catan \\(2nd ed\\.\\)");
  });
});