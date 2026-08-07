import {
  populateRelatedData,
  PopulateConfig,
} from "../src/utils/populate.util";

describe("populateRelatedData", () => {
  const categoryConfig: PopulateConfig = {
    field: "categories",
    localIdsField: "category_ids",
    service: {
      get: jest.fn(async (ids: number[]) => ({
        data: [
          { bgg_id: 1, name: "Strategy" },
          { bgg_id: 2, name: "Party" },
        ].filter((c) => ids.includes(c.bgg_id)),
      })),
    },
    mapKey: "bgg_id",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("attaches related items and removes the raw id field", async () => {
    const items = [{ name: "Catan", category_ids: [1] }];

    const result = await populateRelatedData(items, [categoryConfig]);

    expect(result[0].categories).toEqual([{ bgg_id: 1, name: "Strategy" }]);
    expect(result[0].category_ids).toBeUndefined();
  });

  it("dedupes ids across items before calling the service", async () => {
    const items = [
      { name: "A", category_ids: [1, 2] },
      { name: "B", category_ids: [1] },
    ];

    await populateRelatedData(items, [categoryConfig]);

    expect(categoryConfig.service.get).toHaveBeenCalledTimes(1);
    expect(categoryConfig.service.get).toHaveBeenCalledWith(
      expect.arrayContaining([1, 2]),
    );
    const calledIds = (categoryConfig.service.get as jest.Mock).mock
      .calls[0][0];
    expect(calledIds).toHaveLength(2); // deduped, not [1,2,1]
  });

  it("skips the service call entirely when no items reference that config's ids", async () => {
    const items = [{ name: "No categories", category_ids: [] }];

    const result = await populateRelatedData(items, [categoryConfig]);

    expect(categoryConfig.service.get).not.toHaveBeenCalled();
    expect(result[0].categories).toEqual([]);
  });

  it("drops ids that the service didn't return data for", async () => {
    const items = [{ name: "Catan", category_ids: [1, 999] }];

    const result = await populateRelatedData(items, [categoryConfig]);

    // 999 has no match in the mocked service response, so it's filtered out
    expect(result[0].categories).toEqual([{ bgg_id: 1, name: "Strategy" }]);
  });

  it("handles multiple configs independently on the same items", async () => {
    const designerConfig: PopulateConfig = {
      field: "designers",
      localIdsField: "designer_ids",
      service: {
        get: jest.fn(async () => ({
          data: [{ bgg_id: 10, name: "Klaus Teuber" }],
        })),
      },
      mapKey: "bgg_id",
    };

    const items = [{ name: "Catan", category_ids: [1], designer_ids: [10] }];

    const result = await populateRelatedData(items, [
      categoryConfig,
      designerConfig,
    ]);

    expect(result[0].categories).toEqual([{ bgg_id: 1, name: "Strategy" }]);
    expect(result[0].designers).toEqual([{ bgg_id: 10, name: "Klaus Teuber" }]);
    expect(result[0].category_ids).toBeUndefined();
    expect(result[0].designer_ids).toBeUndefined();
  });

  it("returns items unchanged (minus id field) when items array is empty", async () => {
    const result = await populateRelatedData([], [categoryConfig]);
    expect(result).toEqual([]);
  });
});
