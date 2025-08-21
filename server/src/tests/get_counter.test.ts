import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a counter by id', async () => {
    // Create a test counter
    const insertResult = await db.insert(countersTable)
      .values({
        value: 42
      })
      .returning()
      .execute();

    const createdCounter = insertResult[0];

    // Get the counter by ID
    const result = await getCounter(createdCounter.id);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdCounter.id);
    expect(result!.value).toEqual(42);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent counter', async () => {
    // Try to get a counter that doesn't exist
    const result = await getCounter(999);

    expect(result).toBeNull();
  });

  it('should handle counters with default values', async () => {
    // Create a counter with default value (0)
    const insertResult = await db.insert(countersTable)
      .values({}) // No value specified, should use default
      .returning()
      .execute();

    const createdCounter = insertResult[0];

    // Get the counter by ID
    const result = await getCounter(createdCounter.id);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdCounter.id);
    expect(result!.value).toEqual(0); // Default value
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should handle negative counter values', async () => {
    // Create a counter with negative value
    const insertResult = await db.insert(countersTable)
      .values({
        value: -15
      })
      .returning()
      .execute();

    const createdCounter = insertResult[0];

    // Get the counter by ID
    const result = await getCounter(createdCounter.id);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdCounter.id);
    expect(result!.value).toEqual(-15);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return the most recently created counter when multiple exist', async () => {
    // Create multiple counters
    const counter1 = await db.insert(countersTable)
      .values({ value: 10 })
      .returning()
      .execute();

    const counter2 = await db.insert(countersTable)
      .values({ value: 20 })
      .returning()
      .execute();

    // Get each counter individually to verify they're distinct
    const result1 = await getCounter(counter1[0].id);
    const result2 = await getCounter(counter2[0].id);

    // Verify each counter has its own values
    expect(result1).toBeDefined();
    expect(result1!.id).toEqual(counter1[0].id);
    expect(result1!.value).toEqual(10);

    expect(result2).toBeDefined();
    expect(result2!.id).toEqual(counter2[0].id);
    expect(result2!.value).toEqual(20);

    // Verify they have different IDs
    expect(result1!.id).not.toEqual(result2!.id);
  });
});