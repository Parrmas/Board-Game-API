import request from "supertest";
import app from "../src/app";

describe("app-level behavior", () => {
  it("returns a 404 JSON payload for an unmatched route", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Route not found" });
  });

  it("serves the swagger docs UI", async () => {
    const res = await request(app).get("/docs/");
    expect([200, 301, 302]).toContain(res.status);
  });
});
