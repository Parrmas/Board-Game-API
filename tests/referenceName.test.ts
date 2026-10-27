import request from "supertest";
import app from "../src/app";
import Category from "../src/module/category/category.model";
import Mechanic from "../src/module/mechanic/mechanic.model";
import Designer from "../src/module/designer/designer.model";
import Publisher from "../src/module/publisher/publisher.model";

describe("GET /api/categories/list name filter", () => {
  it("matches category names case-insensitively", async () => {
    await Category.create([
      { _id: "c1", bgg_id: 1, name: "Strategy" },
      { _id: "c2", bgg_id: 2, name: "Party" },
    ]);

    const res = await request(app).get("/api/categories/list?name=strat");

    expect(res.status).toBe(200);
    expect(
      res.body.data.data.map((item: { name: string }) => item.name),
    ).toEqual(["Strategy"]);
  });

  it("rejects an empty name", async () => {
    const res = await request(app).get("/api/categories/list?name=");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/mechanics/list name filter", () => {
  it("matches mechanic names case-insensitively", async () => {
    await Mechanic.create([
      { _id: "m1", bgg_id: 1, name: "Strategy" },
      { _id: "m2", bgg_id: 2, name: "Drafting" },
    ]);

    const res = await request(app).get("/api/mechanics/list?name=strat");

    expect(res.status).toBe(200);
    expect(
      res.body.data.data.map((item: { name: string }) => item.name),
    ).toEqual(["Strategy"]);
  });

  it("rejects an empty name", async () => {
    const res = await request(app).get("/api/mechanics/list?name=");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/designers/list name filter", () => {
  it("matches designer names case-insensitively", async () => {
    await Designer.create([
      { _id: "d1", bgg_id: 1, name: "Strategy Designer" },
      { _id: "d2", bgg_id: 2, name: "Other Designer" },
    ]);

    const res = await request(app).get("/api/designers/list?name=strat");

    expect(res.status).toBe(200);
    expect(
      res.body.data.data.map((item: { name: string }) => item.name),
    ).toEqual(["Strategy Designer"]);
  });

  it("rejects an empty name", async () => {
    const res = await request(app).get("/api/designers/list?name=");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/publishers/list name filter", () => {
  it("matches publisher names case-insensitively", async () => {
    await Publisher.create([
      { _id: "p1", bgg_id: 1, name: "Strategy Publishing" },
      { _id: "p2", bgg_id: 2, name: "Other Publishing" },
    ]);

    const res = await request(app).get("/api/publishers/list?name=strat");

    expect(res.status).toBe(200);
    expect(
      res.body.data.data.map((item: { name: string }) => item.name),
    ).toEqual(["Strategy Publishing"]);
  });

  it("rejects an empty name", async () => {
    const res = await request(app).get("/api/publishers/list?name=");
    expect(res.status).toBe(400);
  });
});
