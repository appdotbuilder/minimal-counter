import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const getCounter = async (id: number): Promise<Counter | null> => {
  try {
    const result = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Counter retrieval failed:', error);
    throw error;
  }
};