import request from "supertest";
import app from "../src/app";
import Game from "../src/module/game/game.model";

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
        id: expect.any(String),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "user",
        savedGameIds: [],
      }),
    );
    for (const field of [
      "__v",
      "_id",
      "fav_games_ids",
      "isLoggedIn",
      "password",
      "refreshTokenHash",
      "created_at",
      "updated_at",
    ]) {
      expect(meRes.body.data).not.toHaveProperty(field);
    }
  });

  it("returns saved game IDs after adding a profile game", async () => {
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    const token = loginRes.body.data.token;

    await Game.create({
      _id: "saved-game",
      bgg_id: 42,
      name: "Saved Game",
      description: "A test game",
      year_published: 2020,
      min_players: 1,
      max_players: 4,
      playing_time: 60,
      min_playtime: 30,
      max_playtime: 60,
      min_age: 8,
      image_url: "http://example.com/game.jpg",
      thumbnail_url: "http://example.com/game-thumb.jpg",
      average_rating: 7,
      complexity_weight: 2,
    });

    const addRes = await request(app)
      .post("/api/auth/profile-games/42")
      .set("Authorization", `Bearer ${token}`);
    expect(addRes.status).toBe(200);
    expect(addRes.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ bgg_id: 42 })]),
    );

    const meRes = await request(app)
      .get("/api/auth/user")
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.savedGameIds).toEqual([42]);
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
