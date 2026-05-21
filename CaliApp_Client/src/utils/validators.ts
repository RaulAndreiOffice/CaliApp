import { z } from 'zod';

export const emailSchema = z.string().email('Email invalid');

export const passwordSchema = z
  .string()
  .min(8, 'Parola trebuie sa aiba minim 8 caractere')
  .regex(/[A-Z]/, 'Parola trebuie sa contina o litera mare')
  .regex(/[0-9]/, 'Parola trebuie sa contina o cifra');

export const usernameSchema = z
  .string()
  .min(3, 'Username-ul trebuie sa aiba minim 3 caractere')
  .max(50, 'Username-ul nu poate depasi 50 de caractere');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Parola este obligatorie'),
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parolele nu coincid',
    path: ['confirmPassword'],
  });

export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Numele este obligatoriu').max(100),
  measurementType: z.enum(['reps', 'time']),
  category: z.string().optional(),
  description: z.string().optional(),
  defaultSets: z.number().int().positive().optional(),
  defaultTargetValue: z.number().positive().optional(),
  defaultRestSeconds: z.number().int().nonnegative().optional(),
});

export const createWorkoutTableSchema = z.object({
  name: z.string().min(1, 'Numele este obligatoriu').max(100),
  description: z.string().optional(),
});

export const createWorkoutTableRowSchema = z.object({
  exerciseId: z.string().uuid(),
  plannedSets: z.number().int().positive(),
  plannedTargetValue: z.number().positive(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const createPerformedSetSchema = z.object({
  setNumber: z.number().int().positive(),
  actualValue: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const shareSchema = z.object({
  email: emailSchema,
  permission: z.enum(['view', 'copy']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type CreateWorkoutTableInput = z.infer<typeof createWorkoutTableSchema>;
export type CreateWorkoutTableRowInput = z.infer<typeof createWorkoutTableRowSchema>;
export type CreatePerformedSetInput = z.infer<typeof createPerformedSetSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
