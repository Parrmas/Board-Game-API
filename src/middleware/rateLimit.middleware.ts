import rateLimit from "express-rate-limit";

const createLimiter = (max: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    skip: () => process.env.NODE_ENV === "test",
    message: {
      success: false,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
  });

export const authLimiter = createLimiter(10); // login, register
export const refreshLimiter = createLimiter(60); // session restore / token refresh
