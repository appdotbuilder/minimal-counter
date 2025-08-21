import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CounterOperationInput } from '../schema';
import { decrementCounter } from '../handlers/decrement_counter';
import { eq } from 'drizzle-orm';

describe('decrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should decrement counter value by 1', async () => {
    // Create a counter with initial value
    const initialCounter = await db.insert(countersTable)
      .values({ value: 5 })
      .returning()
      .execute();

    const testInput: CounterOperationInput = {
      id: initialCounter[0].id
    };

    const result = await decrementCounter(testInput);

    // Verify the counter was decremented
    expect(result.id).toEqual(initialCounter[0].id);
    expect(result.value).toEqual(4); // 5 - 1 = 4
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > initialCounter[0].updated_at).toBe(true);
  });

  it('should handle zero value correctly', async () => {
    // Create a counter with zero value
    const initialCounter = await db.insert(countersTable)
      .values({ value: 0 })
      .returning()
      .execute();

    const testInput: CounterOperationInput = {
      id: initialCounter[0].id
    };

    const result = await decrementCounter(testInput);

    // Verify the counter was decremented to negative
    expect(result.value).toEqual(-1); // 0 - 1 = -1
  });

  it('should handle negative values correctly', async () => {
    // Create a counter with negative value
    const initialCounter = await db.insert(countersTable)
      .values({ value: -3 })
      .returning()
      .execute();

    const testInput: CounterOperationInput = {
      id: initialCounter[0].id
    };

    const result = await decrementCounter(testInput);

    // Verify the counter was decremented further into negative
    expect(result.value).toEqual(-4); // -3 - 1 = -4
  });

  it('should save decremented value to database', async () => {
    // Create a counter with initial value
    const initialCounter = await db.insert(countersTable)
      .values({ value: 10 })
      .returning()
      .execute();

    const testInput: CounterOperationInput = {
      id: initialCounter[0].id
    };

    await decrementCounter(testInput);

    // Query database directly to verify the change was persisted
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, initialCounter[0].id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(9); // 10 - 1 = 9
    expect(counters[0].updated_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at > initialCounter[0].updated_at).toBe(true);
  });

  it('should throw error for non-existent counter', async () => {
    const testInput: CounterOperationInput = {
      id: 999999 // Non-existent ID
    };

    await expect(decrementCounter(testInput)).rejects.toThrow(/not found/i);
  });

  it('should handle large numbers correctly', async () => {
    // Create a counter with large value
    const initialCounter = await db.insert(countersTable)
      .values({ value: 1000000 })
      .returning()
      .execute();

    const testInput: CounterOperationInput = {
      id: initialCounter[0].id
    };

    const result = await decrementCounter(testInput);

    expect(result.value).toEqual(999999); // 1000000 - 1 = 999999
  });

  it('should update timestamp correctly', async () => {
    // Create a counter
    const initialCounter = await db.insert(countersTable)
      .values({ value: 1 })
      .returning()
      .execute();

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const testInput: CounterOperationInput = {
      id: initialCounter[0].id
    };

    const result = await decrementCounter(testInput);

    // Verify updated_at timestamp was changed
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialCounter[0].updated_at.getTime());
    expect(result.created_at).toEqual(initialCounter[0].created_at); // created_at should remain unchanged
  });
});