import { Response } from "express";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} from "../src/utils/cookieHelper.util";

const mockRes = () => {
  const res: Partial<Response> = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("cookieHelper.util", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it.each([
    ["test", "lax", false],
    ["production", "none", true],
  ] as const)("sets and clears the refresh cookie correctly in %s", (environment, sameSite, secure) => {
    process.env.NODE_ENV = environment;
    const setRes = mockRes();
    const clearRes = mockRes();

    setRefreshTokenCookie(setRes, "sometoken");
    clearRefreshTokenCookie(clearRes);

    expect(setRes.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      "sometoken",
      expect.objectContaining({
        httpOnly: true,
        secure,
        sameSite,
        path: "/api/auth",
      }),
    );
    expect(clearRes.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, {
      path: "/api/auth",
      sameSite,
      secure,
    });
  });
});
