import { Application } from "express";

const loadApp = (): Application => {
  let app!: Application;
  jest.isolateModules(() => {
    // Stub dotenv so a developer's .env/.local.env can't override NODE_ENV
    jest.doMock("dotenv", () => ({
      __esModule: true,
      default: { config: jest.fn() },
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    app = require("../src/app").default;
  });
  return app;
};

describe("trust proxy setting", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.dontMock("dotenv");
  });

  it("is disabled outside production", () => {
    process.env.NODE_ENV = "test";
    expect(loadApp().get("trust proxy")).toBe(false);
  });

  it("trusts exactly one proxy hop in production", () => {
    process.env.NODE_ENV = "production";
    expect(loadApp().get("trust proxy")).toBe(1);
  });
});
