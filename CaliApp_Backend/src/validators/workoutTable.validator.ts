import { z } from "zod";

export const createWorkoutTableSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateWorkoutTableSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createWorkoutTableRowSchema = z.object({
  exerciseId: z.string().uuid(),
  plannedSets: z.number().int().positive(),
  plannedTargetValue: z.number().positive(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const updateWorkoutTableRowSchema = z.object({
  plannedSets: z.number().int().positive().optional(),
  plannedTargetValue: z.number().positive().optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const reorderRowsSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
});
