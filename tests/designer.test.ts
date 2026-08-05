import request from "supertest";
import app from "../src/app";
import Designer from "../src/module/designer/designer.model";

describe("GET /api/designers/list", () => {
  it("returns paginated designers", async () => {
    await Designer.create([
      { _id: "d1", bgg_id: 1, name: "Klaus Teuber" },
      { _id: "d2", bgg_id: 2, name: "Reiner Knizia" },
    ]);

    const res = await request(app).get("/api/designers/list?limit=10&page=1");
    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
  });
});

describe("GET /api/designers/get/:bgg_id", () => {
  it("returns designers matching bgg_ids", async () => {
    await Designer.create({ _id: "d1", bgg_id: 7, name: "Uwe Rosenberg" });
    const res = await request(app).get("/api/designers/get/7");
    expect(res.status).toBe(200);
    expect(res.body.data.data[0].name).toBe("Uwe Rosenberg");
  });
});
