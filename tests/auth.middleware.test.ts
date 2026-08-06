import request from "supertest";
import app from "../src/app";

describe("authenticateToken middleware", () => {
  it("rejects when Authorization header is missing", async () => {
    const res = await request(app).get("/api/auth/user");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token required/i);
  });

  it("rejects when Authorization header has no Bearer prefix", async () => {
    const res = await request(app)
      .get("/api/auth/user")
      .set("Authorization", "sometoken-without-bearer-prefix");
    // "sometoken-without-bearer-prefix".split(" ")[1] is undefined -> falls into missing-token branch
    expect(res.status).toBe(401);
  });

  it("rejects a malformed/garbage token with 403", async () => {
    const res = await request(app)
      .get("/api/auth/user")
      .set("Authorization", "Bearer not.a.valid.jwt");
    expect(res.status).toBe(403);
  });

  it("rejects an empty Bearer token", async () => {
    const res = await request(app)
      .get("/api/auth/user")
      .set("Authorization", "Bearer ");
    expect([401, 403]).toContain(res.status);
  });
});
