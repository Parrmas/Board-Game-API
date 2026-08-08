import * as CategoryService from "../src/module/category/category.service";
import Category from "../src/module/category/category.model";
import { AppError } from "../src/utils/appError.util";

describe("CategoryService.getPopular error handling", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("wraps aggregation errors in an AppError", async () => {
    jest.spyOn(Category, "aggregate").mockImplementation(() => {
      throw new Error("aggregation pipeline failed");
    });

    await expect(CategoryService.getPopular(10, 1)).rejects.toThrow(AppError);
  });
});
