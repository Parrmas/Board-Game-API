import express from "express";
import request from "supertest";
import {
  createMcpLimiter,
  mcpLimiter,
} from "../src/module/mcp/mcp.rateLimit";

describe("MCP rate limiter", () => {
  it("limits requests and returns the standard JSON error", async () => {
    const app = express();
    app.use(express.json());
    app.use(createMcpLimiter(2));
    app.post("/", (_req, res) => res.json({ ok: true }));

    const first = await request(app).post("/");
    const second = await request(app).post("/");
    const third = await request(app).post("/");

    expect(first.status).toBe(200);
    expect(first.headers["ratelimit-limit"]).toBe("2");
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
    expect(third.body.success).toBe(false);
    expect(third.body.message).toEqual(expect.stringContaining("Too many"));
  });

  it("defaults to 60 requests per minute", async () => {
    const app = express();
    app.use(createMcpLimiter());
    app.post("/", (_req, res) => res.json({ ok: true }));

    let response = await request(app).post("/");
    for (let attempt = 1; attempt < 61; attempt += 1) {
      response = await request(app).post("/");
    }

    expect(response.status).toBe(429);
  });

  it("lets test requests pass through the exported limiter", async () => {
    const app = express();
    app.use(mcpLimiter);
    app.post("/", (_req, res) => res.json({ ok: true }));

    const responses = await Promise.all(
      Array.from({ length: 100 }, () => request(app).post("/")),
    );

    expect(process.env.NODE_ENV).toBe("test");
    expect(responses.every((response) => response.status === 200)).toBe(true);
  });
});
