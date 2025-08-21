import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const resetCounter = async (input: ResetCounterInput): Promise<Counter> => {
  try {
    // Update the counter with the new value and updated timestamp
    // Apply default value if not provided (Zod default is 0)
    const resetValue = input.value ?? 0;
    
    const result = await db.update(countersTable)
      .set({
        value: resetValue,
        updated_at: new Date()
      })
      .where(eq(countersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Counter with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Counter reset failed:', error);
    throw error;
  }
};