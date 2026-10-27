import { Request, Response } from "express";
import { Widget } from "./helpers/testModels";
import { createListController } from "../src/utils/crudController.factory";
import { createListService } from "../src/utils/crudService.factory";
import { createListQuerySchema } from "../src/utils/crudSchema.factory";

describe("createListService name filter", () => {
  const list = createListService(Widget, "widgets");

  it("matches names case-insensitively and partially in name order", async () => {
    await Widget.create([
      { _id: "w1", bgg_id: 1, name: "Pineapple" },
      { _id: "w2", bgg_id: 2, name: "Banana" },
      { _id: "w3", bgg_id: 3, name: "Apple" },
    ]);

    const result = await list(10, 1, "app");

    expect(result.data.map(({ name }) => name)).toEqual(["Apple", "Pineapple"]);
  });

  it("treats regex characters in the name literally", async () => {
    await Widget.create([
      { _id: "w1", bgg_id: 1, name: "A.B" },
      { _id: "w2", bgg_id: 2, name: "AxB" },
    ]);

    const result = await list(10, 1, "A.B");

    expect(result.data.map(({ name }) => name)).toEqual(["A.B"]);
  });

  it("returns no results when no name matches", async () => {
    await Widget.create({ _id: "w1", bgg_id: 1, name: "Apple" });

    await expect(list(10, 1, "missing")).resolves.toEqual({ data: [] });
  });

  it("returns every record when name is omitted", async () => {
    await Widget.create([
      { _id: "w1", bgg_id: 1, name: "Apple" },
      { _id: "w2", bgg_id: 2, name: "Banana" },
    ]);

    const result = await list();

    expect(result.data.map(({ name }) => name)).toEqual(["Apple", "Banana"]);
  });
});

describe("createListQuerySchema name", () => {
  const schema = createListQuerySchema(1, 50);

  it("trims a provided name", () => {
    expect(schema.parse({ name: "  cat " }).name).toBe("cat");
  });

  it("rejects an empty name", () => {
    expect(schema.safeParse({ name: "" }).success).toBe(false);
  });

  it("keeps the existing defaults when name is omitted", () => {
    expect(schema.parse({})).toEqual({ limit: 10, page: 1 });
  });
});

describe("createListController name", () => {
  it("passes a defined name to the service", async () => {
    const service = jest.fn().mockResolvedValue({ data: [] });
    const controller = createListController(service);
    const req = {
      query: { limit: 10, page: 1, name: "cat" },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller(req, res);

    expect(service).toHaveBeenCalledWith(10, 1, "cat");
  });
});
