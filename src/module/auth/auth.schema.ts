// src/module/auth/auth.schema.ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  username: z.string().trim().min(3).max(30),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
