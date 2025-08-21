import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CounterOperationInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';
import { eq } from 'drizzle-orm';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment counter value by 1', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({ value: 5 })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id
    };

    const result = await incrementCounter(input);

    // Verify the counter was incremented
    expect(result.id).toEqual(counter.id);
    expect(result.value).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toEqual(counter.created_at);
    
    // Verify updated_at was actually updated
    expect(result.updated_at.getTime()).toBeGreaterThan(counter.updated_at.getTime());
  });

  it('should increment counter from 0 to 1', async () => {
    // Create a counter with default value 0
    const [counter] = await db.insert(countersTable)
      .values({ value: 0 })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(1);
    expect(result.id).toEqual(counter.id);
  });

  it('should increment negative counter values', async () => {
    // Create a counter with negative value
    const [counter] = await db.insert(countersTable)
      .values({ value: -3 })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id
    };

    const result = await incrementCounter(input);

    expect(result.value).toEqual(-2);
    expect(result.id).toEqual(counter.id);
  });

  it('should save incremented value to database', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({ value: 10 })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id
    };

    const result = await incrementCounter(input);

    // Query the database to verify the change was persisted
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(11);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at.getTime()).toBeGreaterThan(counter.updated_at.getTime());
  });

  it('should throw error when counter does not exist', async () => {
    const input: CounterOperationInput = {
      id: 99999 // Non-existent ID
    };

    await expect(incrementCounter(input)).rejects.toThrow(/Counter with id 99999 not found/i);
  });

  it('should handle multiple increments correctly', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({ value: 0 })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id
    };

    // Increment multiple times
    const result1 = await incrementCounter(input);
    expect(result1.value).toEqual(1);

    const result2 = await incrementCounter(input);
    expect(result2.value).toEqual(2);

    const result3 = await incrementCounter(input);
    expect(result3.value).toEqual(3);

    // Verify final state in database
    const finalCounters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, counter.id))
      .execute();

    expect(finalCounters[0].value).toEqual(3);
  });
});