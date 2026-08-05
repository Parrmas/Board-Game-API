import request from "supertest";
import app from "../src/app";

describe("Logout / token blacklist", () => {
  const user = {
    email: "logout@example.com",
    password: "password123",
    username: "logoutuser",
    firstName: "Log",
    lastName: "Out",
  };

  it("invalidates the token on logout and rejects it afterward", async () => {
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    const token = loginRes.body.data.token;

    const logoutRes = await request(app)
      .post("/api/auth/invalidate-token")
      .set("Authorization", `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    const meRes = await request(app)
      .get("/api/auth/user")
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(403);
  });

  it("allows logging back in after logout", async () => {
    await request(app).post("/api/auth/register").send(user);
    const firstLogin = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    await request(app)
      .post("/api/auth/invalidate-token")
      .set("Authorization", `Bearer ${firstLogin.body.data.token}`);

    const secondLogin = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    expect(secondLogin.status).toBe(200);
  });
});
