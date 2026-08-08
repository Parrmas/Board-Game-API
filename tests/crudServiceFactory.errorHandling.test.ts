import { createGetByBggIdService } from "../src/utils/crudService.factory";
import { AppError } from "../src/utils/appError.util";
import { IWidget, Widget } from "./helpers/testModels";

describe("createGetByBggIdService error handling", () => {
  const get = createGetByBggIdService<IWidget>(Widget, "widgets");

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("wraps DB errors in an AppError with status 500", async () => {
    jest.spyOn(Widget, "find").mockImplementation(() => {
      throw new Error("connection lost");
    });

    await expect(get([1])).rejects.toThrow(AppError);
    await expect(get([1])).rejects.toMatchObject({ statusCode: 500 });
  });
});
