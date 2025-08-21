import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CreateCounterInput, type Counter } from '../schema';

export const createCounter = async (input: CreateCounterInput): Promise<Counter> => {
  try {
    // Insert counter record
    const result = await db.insert(countersTable)
      .values({
        value: input.value, // Will use default 0 if not provided (handled by Zod schema)
      })
      .returning()
      .execute();

    // Return the created counter
    const counter = result[0];
    return {
      ...counter,
    };
  } catch (error) {
    console.error('Counter creation failed:', error);
    throw error;
  }
};