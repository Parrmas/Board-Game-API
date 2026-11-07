import { Response } from "express";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // matches REFRESH_TOKEN_EXPIRE_IN default
const REFRESH_COOKIE_PATH = "/api/auth";

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    path: REFRESH_COOKIE_PATH,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    secure: isProduction,
  };
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    ...getRefreshCookieOptions(),
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

export { REFRESH_COOKIE_NAME };
