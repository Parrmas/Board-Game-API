import { populateRelatedData } from "../src/utils/populate.util";

describe("populateRelatedData", () => {
  const categoryConfig = {
    field: "categories",
    localIdsField: "category_ids",
    mapKey: "bgg_id",
    service: {
      get: async (ids: number[]) => ({
        data: [
          { bgg_id: 1, name: "Strategy" },
          { bgg_id: 2, name: "Party" },
        ].filter((c) => ids.includes(c.bgg_id)),
      }),
    },
  };

  const designerConfig = {
    field: "designers",
    localIdsField: "designer_ids",
    mapKey: "bgg_id",
    service: {
      get: async (ids: number[]) => ({
        data: [{ bgg_id: 10, name: "Klaus Teuber" }].filter((d) =>
          ids.includes(d.bgg_id),
        ),
      }),
    },
  };

  it("populates multiple related fields on a single item", async () => {
    const items = [{ category_ids: [1], designer_ids: [10] }];
    const result = await populateRelatedData(items, [
      categoryConfig,
      designerConfig,
    ]);

    expect(result[0].categories).toEqual([{ bgg_id: 1, name: "Strategy" }]);
    expect(result[0].designers).toEqual([{ bgg_id: 10, name: "Klaus Teuber" }]);
    expect(result[0].category_ids).toBeUndefined();
    expect(result[0].designer_ids).toBeUndefined();
  });

  it("filters out ids with no matching related document", async () => {
    const items = [{ category_ids: [1, 999] }]; // 999 doesn't exist
    const result = await populateRelatedData(items, [categoryConfig]);

    expect(result[0].categories).toEqual([{ bgg_id: 1, name: "Strategy" }]);
  });

  it("returns items unchanged (minus deleted id fields) when configs is empty", async () => {
    const items = [{ category_ids: [1], name: "Catan" }];
    const result = await populateRelatedData(items, []);

    expect(result).toEqual(items); // no dataMaps entries, nothing deleted
  });

  it("handles an item with no local ids for a config (empty array default)", async () => {
    const items = [{ name: "No categories here" }];
    const result = await populateRelatedData(items, [categoryConfig]);

    expect(result[0].categories).toEqual([]);
  });

  it("dedupes ids across multiple items before fetching", async () => {
    let fetchedIds: number[] = [];
    const spyConfig = {
      ...categoryConfig,
      service: {
        get: async (ids: number[]) => {
          fetchedIds = ids;
          return { data: [{ bgg_id: 1, name: "Strategy" }] };
        },
      },
    };
    const items = [{ category_ids: [1] }, { category_ids: [1] }];
    await populateRelatedData(items, [spyConfig]);

    expect(fetchedIds).toEqual([1]); // deduped via Set
  });
});
