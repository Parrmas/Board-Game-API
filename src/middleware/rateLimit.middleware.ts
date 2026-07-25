import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
});