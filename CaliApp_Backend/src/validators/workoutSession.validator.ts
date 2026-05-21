import { z } from "zod";

export const startSessionSchema = z.object({
  workoutTableId: z.uuid().optional(),
});

export const updateSessionSchema = z.object({
  status: z.enum(["completed", "cancelled"]),
  notes: z.string().optional(),
});

export const logRestDaySchema = z.object({
  date: z.iso.datetime().optional(),
  notes: z.string().max(500).optional(),
});
