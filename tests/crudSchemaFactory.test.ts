import {
  createListQuerySchema,
  bggIdParamSchema,
} from "../src/utils/crudSchema.factory";

describe("createListQuerySchema", () => {
  const schema = createListQuerySchema(1, 50);

  it("applies defaults when limit/page are omitted", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ limit: 10, page: 1 });
    }
  });

  it("coerces string query params into numbers", () => {
    const result = schema.safeParse({ limit: "5", page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ limit: 5, page: 2 });
    }
  });

  it("rejects a limit below the configured minimum", () => {
    const result = schema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a limit above the configured maximum", () => {
    const result = schema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer limit", () => {
    const result = schema.safeParse({ limit: 5.5 });
    expect(result.success).toBe(false);
  });

  it("rejects a page below 1", () => {
    const result = schema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("respects custom min/max bounds passed to the factory", () => {
    const narrowSchema = createListQuerySchema(5, 10);
    expect(narrowSchema.safeParse({ limit: 4 }).success).toBe(false);
    expect(narrowSchema.safeParse({ limit: 5 }).success).toBe(true);
    expect(narrowSchema.safeParse({ limit: 10 }).success).toBe(true);
    expect(narrowSchema.safeParse({ limit: 11 }).success).toBe(false);
  });
});

describe("bggIdParamSchema", () => {
  it("parses a single numeric id into a one-element array", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bgg_id).toEqual([42]);
    }
  });

  it("parses a comma-separated list into an array of numbers", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "1,2,3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bgg_id).toEqual([1, 2, 3]);
    }
  });

  it("trims whitespace around comma-separated ids", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: " 1 , 2 ,3 " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bgg_id).toEqual([1, 2, 3]);
    }
  });

  it("fails when any entry in the list is non-numeric", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "1,abc,3" });
    expect(result.success).toBe(false);
  });

  it("fails when every entry is non-numeric", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "abc,def" });
    expect(result.success).toBe(false);
  });

  it("fails on an empty string", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "" });
    expect(result.success).toBe(false);
  });

  it("fails when bgg_id is missing entirely", () => {
    const result = bggIdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("bggIdParamSchema — CSV edge cases", () => {
  it("fails on a trailing comma (empty final token)", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "1,2," });
    expect(result.success).toBe(false);
  });

  it("fails on a leading comma (empty first token)", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: ",1,2" });
    expect(result.success).toBe(false);
  });

  it("fails on a whitespace-only token between commas", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "1, ,3" });
    expect(result.success).toBe(false);
  });

  it("fails on consecutive commas (double delimiter)", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "1,,3" });
    expect(result.success).toBe(false);
  });

  it("fails on a string that is only whitespace", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "   " });
    expect(result.success).toBe(false);
  });

  it("fails on a single trailing comma with no second value", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "42," });
    expect(result.success).toBe(false);
  });

  it("still succeeds on a clean multi-id list with internal spacing", () => {
    const result = bggIdParamSchema.safeParse({ bgg_id: "1, 2, 3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bgg_id).toEqual([1, 2, 3]);
    }
  });
});
