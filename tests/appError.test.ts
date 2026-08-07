import { AppError } from "../src/utils/appError.util";

describe("AppError", () => {
  it("defaults statusCode to 500 when not provided", () => {
    const err = new AppError("boom");
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("boom");
  });

  it("accepts a custom status code", () => {
    const err = new AppError("not found", 404);
    expect(err.statusCode).toBe(404);
  });

  it("is a real Error and preserves instanceof through the prototype fix", () => {
    const err = new AppError("bad request", 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("carries the ErrorOptions cause when given", () => {
    const cause = new Error("underlying");
    const err = new AppError("wrapped", 500, { cause });
    expect(err.cause).toBe(cause);
  });
});
