import request from "supertest";
import app from "../src/app";
import Publisher from "../src/module/publisher/publisher.model";

describe("GET /api/publishers/list", () => {
  it("returns paginated publishers", async () => {
    await Publisher.create([
      { _id: "p1", bgg_id: 1, name: "Kosmos" },
      { _id: "p2", bgg_id: 2, name: "Days of Wonder" },
    ]);

    const res = await request(app).get("/api/publishers/list?limit=10&page=1");
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
  });
});

describe("GET /api/publishers/get/:bgg_id", () => {
  it("returns publishers matching bgg_ids", async () => {
    await Publisher.create({ _id: "p1", bgg_id: 9, name: "Z-Man Games" });
    const res = await request(app).get("/api/publishers/get/9");
    expect(res.status).toBe(200);
    expect(res.body.data.data[0].name).toBe("Z-Man Games");
  });
});
