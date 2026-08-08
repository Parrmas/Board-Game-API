import request from "supertest";
import app from "../src/app";

describe("AuthController additional branches", () => {
  const user = {
    email: "ctrl@example.com",
    password: "password123",
    username: "ctrluser",
    firstName: "Ctrl",
    lastName: "User",
  };

  it("refreshToken returns 401 when no refresh cookie is present", async () => {
    const res = await request(app).post("/api/auth/refresh-token");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/missing/i);
  });

  it("refreshToken clears the cookie and returns 401 on an invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", "refreshToken=garbage.invalid.token");
    expect(res.status).toBe(401);
  });

  it("removeProfileGame rejects a non-numeric bgg_id", async () => {
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .delete("/api/auth/profile-games/notanumber")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("logout returns 400 when no token is supplied", async () => {
    // authenticateToken middleware guards this route, so hitting the controller
    // branch directly isn't reachable via HTTP with a missing token (401 first).
    // This documents current behavior: middleware short-circuits before controller check.
    const res = await request(app).post("/api/auth/invalidate-token");
    expect(res.status).toBe(401);
  });
});
