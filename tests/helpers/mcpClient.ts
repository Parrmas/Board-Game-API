import request, { Response } from "supertest";
import app from "../../src/app";

export const callMcp = (method: string, params?: object): Promise<Response> =>
  request(app)
    .post("/api/mcp")
    .set("Accept", "application/json, text/event-stream")
    .set("Content-Type", "application/json")
    .send({ jsonrpc: "2.0", id: 1, method, params });

export const callTool = (name: string, args?: object): Promise<Response> =>
  callMcp("tools/call", { name, arguments: args ?? {} });
