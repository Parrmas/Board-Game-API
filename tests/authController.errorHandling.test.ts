import request from "supertest";
import app from "../src/app";
import { testControllerErrorBranches } from "./helpers/controllerErrors";
import * as AuthService from "../src/module/auth/auth.service";

describe("Auth controller — remaining error branches", () => {
  const user = {
    email: "errbranch@example.com",
    password: "password123",
    username: "errbranchuser",
    firstName: "Err",
    lastName: "Branch",
  };

  let token: string;

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app)
      .post("/api/auth/get-token")
      .send({ email: user.email, password: user.password });
    token = loginRes.body.data.token;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  testControllerErrorBranches(app, {
    label: "POST /api/auth/invalidate-token (logout)",
    method: "post",
    url: "/api/auth/invalidate-token",
    getSpy: () => jest.spyOn(AuthService, "logout"),
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });

  testControllerErrorBranches(app, {
    label: "GET /api/auth/profile-games",
    method: "get",
    url: "/api/auth/profile-games",
    getSpy: () => jest.spyOn(AuthService, "getSavedGame"),
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });

  testControllerErrorBranches(app, {
    label: "POST /api/auth/profile-games/:bgg_id (addProfileGame)",
    method: "post",
    url: "/api/auth/profile-games/1",
    getSpy: () => jest.spyOn(AuthService, "addSavedGame"),
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });

  testControllerErrorBranches(app, {
    label: "DELETE /api/auth/profile-games/:bgg_id (removeProfileGame)",
    method: "delete",
    url: "/api/auth/profile-games/1",
    getSpy: () => jest.spyOn(AuthService, "removeSavedGame"),
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });
});

describe("POST /api/auth/register error branches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  testControllerErrorBranches(app, {
    label: "POST /api/auth/register",
    method: "post",
    url: "/api/auth/register",
    getSpy: () => jest.spyOn(AuthService, "register"),
    body: {
      email: "regbranch@example.com",
      password: "password123",
      username: "regbranchuser",
      firstName: "Reg",
      lastName: "Branch",
    },
  });
});

describe("POST /api/auth/get-token error branches", () => {
  const user = {
    email: "loginbranch@example.com",
    password: "password123",
    username: "loginbranchuser",
    firstName: "Login",
    lastName: "Branch",
  };

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  testControllerErrorBranches(app, {
    label: "POST /api/auth/get-token",
    method: "post",
    url: "/api/auth/get-token",
    getSpy: () => jest.spyOn(AuthService, "login"),
    body: { email: user.email, password: user.password },
  });
});
