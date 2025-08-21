import { z } from 'zod';

// Counter schema
export const counterSchema = z.object({
  id: z.number(),
  value: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Counter = z.infer<typeof counterSchema>;

// Input schema for creating a counter
export const createCounterInputSchema = z.object({
  value: z.number().int().optional().default(0) // Default value of 0
});

export type CreateCounterInput = z.infer<typeof createCounterInputSchema>;

// Input schema for counter operations
export const counterOperationInputSchema = z.object({
  id: z.number()
});

export type CounterOperationInput = z.infer<typeof counterOperationInputSchema>;

// Input schema for reset counter
export const resetCounterInputSchema = z.object({
  id: z.number(),
  value: z.number().int().optional().default(0) // Reset to specific value, default 0
});

export type ResetCounterInput = z.infer<typeof resetCounterInputSchema>;