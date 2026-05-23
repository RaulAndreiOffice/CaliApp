import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: passwordSchema,
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
}).strict();

export const refreshSchema = z.object({
  refreshToken: z.string().uuid("Invalid refresh token"),
}).strict();
