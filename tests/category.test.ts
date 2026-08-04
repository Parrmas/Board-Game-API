import request from "supertest";
import app from "../src/app";
import Category from "../src/module/category/category.model";

describe("GET /api/categories/list", () => {
  it("returns paginated categories", async () => {
    await Category.create([
      { _id: "c1", bgg_id: 1, name: "Strategy" },
      { _id: "c2", bgg_id: 2, name: "Party" },
    ]);

    const res = await request(app).get("/api/categories/list?limit=10&page=1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toHaveLength(2);
  });

  it("rejects a limit above the max", async () => {
    const res = await request(app).get("/api/categories/list?limit=999");
    expect(res.status).toBe(400);
  });
});