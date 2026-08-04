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
    const registerRes = await request(app).post("/api/auth/register").send(user);
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