import {
  createListService,
  createGetByBggIdService,
} from "../src/utils/crudService.factory";
import { AppError } from "../src/utils/appError.util";
import { IWidget, Widget } from "./helpers/testModels";

describe("createListService", () => {
  const list = createListService<IWidget>(Widget, "widgets");

  it("paginates and sorts alphabetically by name", async () => {
    await Widget.create([
      { _id: "w1", bgg_id: 1, name: "Zebra" },
      { _id: "w2", bgg_id: 2, name: "Apple" },
    ]);

    const result = await list(10, 1);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe("Apple");
  });

  it("respects limit and skip for page 2", async () => {
    await Widget.create([
      { _id: "w1", bgg_id: 1, name: "A" },
      { _id: "w2", bgg_id: 2, name: "B" },
      { _id: "w3", bgg_id: 3, name: "C" },
    ]);

    const result = await list(1, 2); // limit 1, page 2 -> skip 1
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("B");
  });

  it("wraps DB errors in an AppError with status 500", async () => {
    const originalFind = Widget.find;
    Widget.find = jest.fn().mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(list(10, 1)).rejects.toThrow(AppError);
    await expect(list(10, 1)).rejects.toMatchObject({ statusCode: 500 });

    Widget.find = originalFind;
  });
});

describe("createGetByBggIdService", () => {
  const get = createGetByBggIdService<IWidget>(Widget, "widgets");

  it("returns only widgets matching the given bgg_ids", async () => {
    await Widget.create([
      { _id: "w1", bgg_id: 1, name: "A" },
      { _id: "w2", bgg_id: 2, name: "B" },
      { _id: "w3", bgg_id: 3, name: "C" },
    ]);

    const result = await get([1, 3]);
    expect(result.data.map((w) => w.bgg_id).sort()).toEqual([1, 3]);
  });

  it("returns an empty array when no bgg_ids match", async () => {
    const result = await get([9999]);
    expect(result.data).toEqual([]);
  });
});
