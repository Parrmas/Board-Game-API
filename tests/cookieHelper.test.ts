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

  it("sets the refresh cookie with httpOnly/sameSite/path, secure=false outside production", () => {
    process.env.NODE_ENV = "test";
    const res = mockRes();
    setRefreshTokenCookie(res, "sometoken");

    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      "sometoken",
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/api/auth",
      }),
    );
  });

  it("sets secure=true when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    const res = mockRes();
    setRefreshTokenCookie(res, "sometoken");

    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      "sometoken",
      expect.objectContaining({ secure: true }),
    );
  });

  it("clears the refresh cookie scoped to /api/auth", () => {
    const res = mockRes();
    clearRefreshTokenCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, {
      path: "/api/auth",
    });
  });
});
