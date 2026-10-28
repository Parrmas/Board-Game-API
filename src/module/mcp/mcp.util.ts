import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { AppError } from "../../utils/appError.util";

export const toolResult = (data: unknown): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(data) }],
});

export const toolError = (error: unknown): CallToolResult => {
  if (error instanceof AppError) {
    return {
      content: [{ type: "text", text: error.message }],
      isError: true,
    };
  }

  console.error(error);
  return {
    content: [{ type: "text", text: "Internal server error" }],
    isError: true,
  };
};

export const trimGame = (
  game: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(game).filter(([key]) => key !== "description"),
  );

export const trimGames = <T extends { data: Record<string, unknown>[] }>(
  result: T,
): T => ({
  ...result,
  data: result.data.map(trimGame),
});
