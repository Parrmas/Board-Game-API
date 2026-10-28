import { createListQuerySchema } from "../src/utils/crudSchema.factory";

describe("createListQuerySchema name max length", () => {
  const schema = createListQuerySchema(1, 50);

  it("accepts a 100-character name", () => {
    expect(schema.safeParse({ name: "a".repeat(100) }).success).toBe(true);
  });

  it("rejects a 101-character name", () => {
    expect(schema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
  });
});
