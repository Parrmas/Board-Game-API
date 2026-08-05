import { Response } from "express";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // matches REFRESH_TOKEN_EXPIRE_IN default

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/auth", // scope the cookie to auth routes only
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
};

export { REFRESH_COOKIE_NAME };
