import { z } from "zod";

export const createShareSchema = z.object({
  email: z.string().email("Invalid email"),
  permission: z.enum(["view", "copy"]),
});
