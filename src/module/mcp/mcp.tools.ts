import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as FilterUtil from "../../utils/filter.util";
import { toolError, toolResult } from "./mcp.util";

export const registerTools = (server: McpServer): void => {
  server.registerTool(
    "get_filter_options",
    {
      description:
        "Min/max ranges for players, playtime, rating and complexity across the game collection",
    },
    async () => {
      try {
        return toolResult(await FilterUtil.getFilterOptions());
      } catch (e) {
        return toolError(e);
      }
    },
  );
};
