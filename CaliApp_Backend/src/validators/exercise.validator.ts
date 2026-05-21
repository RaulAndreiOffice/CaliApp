import { z } from "zod";

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  measurementType: z.enum(["reps", "time"]),
  category: z.string().max(50).optional(),
  description: z.string().optional(),
  defaultSets: z.number().int().positive().optional(),
  defaultTargetValue: z.number().positive().optional(),
  defaultRestSeconds: z.number().int().nonnegative().optional(),
});

export const updateExerciseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  measurementType: z.enum(["reps", "time"]).optional(),
  category: z.string().max(50).optional(),
  description: z.string().optional(),
  defaultSets: z.number().int().positive().optional(),
  defaultTargetValue: z.number().positive().optional(),
  defaultRestSeconds: z.number().int().nonnegative().optional(),
});
