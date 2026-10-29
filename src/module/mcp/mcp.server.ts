import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./mcp.tools";

export const createMcpServer = (): McpServer => {
  const server = new McpServer({ name: "board-game-api", version: "1.0.0" });
  registerTools(server);
  return server;
};
