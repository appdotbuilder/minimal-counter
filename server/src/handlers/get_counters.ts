import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';

export const getCounters = async (): Promise<Counter[]> => {
  try {
    const results = await db.select()
      .from(countersTable)
      .execute();

    // Return the results - no numeric conversions needed since value is integer
    return results;
  } catch (error) {
    console.error('Failed to fetch counters:', error);
    throw error;
  }
};