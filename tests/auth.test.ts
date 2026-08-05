import request from "supertest";
import app from "../src/app";

describe("Auth flow", () => {
  const user = {
    email: "test@example.com",
    password: "password123",
    username: "tester",
    firstName: "Test",
    lastName: "User",
  };

  it("registers, logs in, and fetches the current user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(user);
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get("/api/auth/user")
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(user.email);
  });

  it("refreshes tokens via cookie and rejects reused refresh tokens", async () => {
    await request(app).post("/api/auth/register").send(user);

    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    const setCookieHeader = loginRes.headers["set-cookie"];
    expect(setCookieHeader).toBeDefined();
    const cookie = setCookieHeader[0];

    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", cookie);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.token).toBeDefined();

    const newCookie = refreshRes.headers["set-cookie"][0];
    expect(newCookie).not.toBe(cookie); // rotation happened

    // Old cookie should now be rejected
    const reuseRes = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", cookie);
    expect(reuseRes.status).toBe(401);
  });

  it("rejects a second login while already logged in", async () => {
    await request(app).post("/api/auth/register").send(user);
    await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    const secondLogin = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    expect(secondLogin.status).toBe(400);
  });
});
