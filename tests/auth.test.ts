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
    expect(loginRes.body.data.token).toBeDefined();
    expect(loginRes.body.data).not.toHaveProperty("refreshToken");
    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get("/api/auth/user")
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "user",
        fav_games_ids: [],
      }),
    );
    for (const field of [
      "__v",
      "isLoggedIn",
      "password",
      "refreshTokenHash",
      "created_at",
      "updated_at",
    ]) {
      expect(meRes.body.data).not.toHaveProperty(field);
    }
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

  it("allows a second login and invalidates the first refresh session", async () => {
    await request(app).post("/api/auth/register").send(user);
    const firstLogin = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    const secondLogin = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    expect(secondLogin.status).toBe(200);
    expect(secondLogin.body.data.token).toBeDefined();
    expect(secondLogin.body.data).not.toHaveProperty("refreshToken");

    const firstRefreshCookie = firstLogin.headers["set-cookie"][0];
    const staleRefresh = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", firstRefreshCookie);
    expect(staleRefresh.status).toBe(401);
  });

  it("checks the password before login state and returns no state details", async () => {
    await request(app).post("/api/auth/register").send(user);
    await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });

    const wrongPassword = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: "wrong-password" });

    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body).toEqual({
      success: false,
      message: "Invalid email or password",
    });
    expect(JSON.stringify(wrongPassword.body)).not.toContain("logged in");
  });
});
