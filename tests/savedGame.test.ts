import request from "supertest";
import app from "../src/app";
import Game from "../src/module/game/game.model";

describe("Saved games flow", () => {
  const user = {
    email: "gamer@example.com",
    password: "password123",
    username: "gamer",
    firstName: "Game",
    lastName: "R",
  };

  const registerAndLogin = async () => {
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    return loginRes.body.data.token as string;
  };

  beforeEach(async () => {
    await Game.create({
      _id: "g1",
      bgg_id: 42,
      name: "Catan",
      description: "d",
      year_published: 1995,
      min_players: 3,
      max_players: 4,
      playing_time: 90,
      min_playtime: 60,
      max_playtime: 90,
      min_age: 10,
      image_url: "u",
      thumbnail_url: "u",
      average_rating: 7,
      complexity_weight: 2,
    });
  });

  it("adds a game to favorites and returns it in profile-games", async () => {
    const token = await registerAndLogin();

    const addRes = await request(app)
      .post("/api/auth/profile-games/42")
      .set("Authorization", `Bearer ${token}`);
    expect(addRes.status).toBe(200);
    expect(addRes.body.data.map((g: { bgg_id: number }) => g.bgg_id)).toContain(
      42,
    );

    const profileRes = await request(app)
      .get("/api/auth/profile-games")
      .set("Authorization", `Bearer ${token}`);
    expect(profileRes.body.data).toHaveLength(1);
  });

  it("does not duplicate a game added twice ($addToSet)", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/auth/profile-games/42")
      .set("Authorization", `Bearer ${token}`);
    const secondAdd = await request(app)
      .post("/api/auth/profile-games/42")
      .set("Authorization", `Bearer ${token}`);

    expect(secondAdd.body.data).toHaveLength(1);
  });

  it("removes a game from favorites", async () => {
    const token = await registerAndLogin();
    await request(app)
      .post("/api/auth/profile-games/42")
      .set("Authorization", `Bearer ${token}`);

    const removeRes = await request(app)
      .delete("/api/auth/profile-games/42")
      .set("Authorization", `Bearer ${token}`);

    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data).toHaveLength(0);
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/auth/profile-games");
    expect(res.status).toBe(401);
  });

  it("rejects a non-numeric bgg_id on add", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/auth/profile-games/notanumber")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
