import { z } from "zod";

export const createPerformedSetSchema = z.object({
  setNumber: z.number().int().positive(),
  actualValue: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const updatePerformedSetSchema = z.object({
  actualValue: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});
