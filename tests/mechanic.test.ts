import request from "supertest";
import app from "../src/app";
import Mechanic from "../src/module/mechanic/mechanic.model";

describe("GET /api/mechanics/list", () => {
  it("returns paginated mechanics", async () => {
    await Mechanic.create([
      { _id: "m1", bgg_id: 1, name: "Worker Placement" },
      { _id: "m2", bgg_id: 2, name: "Deck Building" },
    ]);

    const res = await request(app).get("/api/mechanics/list?limit=10&page=1");
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
  });

  it("rejects a limit above the max", async () => {
    const res = await request(app).get("/api/mechanics/list?limit=999");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/mechanics/get/:bgg_id", () => {
  it("returns mechanics matching bgg_ids", async () => {
    await Mechanic.create({ _id: "m1", bgg_id: 42, name: "Drafting" });
    const res = await request(app).get("/api/mechanics/get/42");
    expect(res.status).toBe(200);
    expect(res.body.data.data[0].name).toBe("Drafting");
  });

  it("rejects a malformed bgg_id", async () => {
    const res = await request(app).get("/api/mechanics/get/notanumber");
    expect(res.status).toBe(400);
  });
});
