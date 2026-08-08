import * as GameService from "../src/module/game/game.service";
import Game from "../src/module/game/game.model";
import { AppError } from "../src/utils/appError.util";

describe("GameService error handling", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("list wraps DB errors in an AppError with status 500", async () => {
    jest.spyOn(Game, "find").mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(GameService.list(10, 1)).rejects.toThrow(AppError);
    await expect(GameService.list(10, 1)).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("get wraps DB errors in an AppError with status 500", async () => {
    jest.spyOn(Game, "find").mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(GameService.get([1, 2])).rejects.toThrow(AppError);
    await expect(GameService.get([1, 2])).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
