import { AppError } from "../src/utils/appError.util";
import {
  toolError,
  toolResult,
  trimGame,
  trimGames,
} from "../src/module/mcp/mcp.util";

describe("MCP result helpers", () => {
  test("toolResult serializes data as text without an error flag", () => {
    const data = { name: "Chess" };

    expect(toolResult(data)).toEqual({
      content: [{ type: "text", text: JSON.stringify(data) }],
    });
  });

  test("toolError relays AppError messages", () => {
    expect(toolError(new AppError("x", 400))).toEqual({
      content: [{ type: "text", text: "x" }],
      isError: true,
    });
  });

  test("toolError hides unexpected error messages", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = toolError(new Error("raw"));

    expect(result).toEqual({
      content: [{ type: "text", text: "Internal server error" }],
      isError: true,
    });
    expect(JSON.stringify(result)).not.toContain("raw");
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test("trimGame removes description and preserves other fields", () => {
    expect(trimGame({ name: "Chess", description: "A strategy game" })).toEqual(
      {
        name: "Chess",
      },
    );
  });

  test("trimGames trims each data item and keeps other result fields", () => {
    const result = {
      data: [
        { name: "Chess", description: "A strategy game" },
        { name: "Go", description: "An abstract game" },
      ],
      total: 2,
    };

    expect(trimGames(result)).toEqual({
      data: [{ name: "Chess" }, { name: "Go" }],
      total: 2,
    });
  });
});
