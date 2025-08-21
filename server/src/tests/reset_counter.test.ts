import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput } from '../schema';
import { resetCounter } from '../handlers/reset_counter';
import { eq } from 'drizzle-orm';

describe('resetCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should reset counter to default value (0)', async () => {
    // Create a counter with initial value
    const [counter] = await db.insert(countersTable)
      .values({ value: 42 })
      .returning()
      .execute();

    const resetInput: ResetCounterInput = {
      id: counter.id,
      value: 0 // Explicit value
    };

    const result = await resetCounter(resetInput);

    // Verify the counter was reset
    expect(result.id).toEqual(counter.id);
    expect(result.value).toEqual(0);
    expect(result.created_at).toEqual(counter.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > counter.updated_at).toBe(true);
  });

  it('should reset counter to specified value', async () => {
    // Create a counter with initial value
    const [counter] = await db.insert(countersTable)
      .values({ value: 100 })
      .returning()
      .execute();

    const resetInput: ResetCounterInput = {
      id: counter.id,
      value: 25 // Reset to specific value
    };

    const result = await resetCounter(resetInput);

    // Verify the counter was reset to specified value
    expect(result.id).toEqual(counter.id);
    expect(result.value).toEqual(25);
    expect(result.created_at).toEqual(counter.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > counter.updated_at).toBe(true);
  });

  it('should reset counter with default value when value is omitted', async () => {
    // Create a counter with initial value
    const [counter] = await db.insert(countersTable)
      .values({ value: 999 })
      .returning()
      .execute();

    // Test with undefined value to simulate omitted field
    const resetInput = {
      id: counter.id,
      value: undefined as any // Simulate value being omitted/undefined
    } as ResetCounterInput;

    const result = await resetCounter(resetInput);

    // Verify the counter was reset to default value (0)
    expect(result.id).toEqual(counter.id);
    expect(result.value).toEqual(0);
    expect(result.created_at).toEqual(counter.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > counter.updated_at).toBe(true);
  });

  it('should update counter in database', async () => {
    // Create a counter with initial value
    const [counter] = await db.insert(countersTable)
      .values({ value: 77 })
      .returning()
      .execute();

    const resetInput: ResetCounterInput = {
      id: counter.id,
      value: 15
    };

    await resetCounter(resetInput);

    // Verify the counter was updated in the database
    const updatedCounters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, counter.id))
      .execute();

    expect(updatedCounters).toHaveLength(1);
    expect(updatedCounters[0].value).toEqual(15);
    expect(updatedCounters[0].updated_at).toBeInstanceOf(Date);
    expect(updatedCounters[0].updated_at > counter.updated_at).toBe(true);
  });

  it('should throw error when counter does not exist', async () => {
    const resetInput: ResetCounterInput = {
      id: 999, // Non-existent counter
      value: 0
    };

    await expect(resetCounter(resetInput)).rejects.toThrow(/counter with id 999 not found/i);
  });

  it('should reset counter to negative value if specified', async () => {
    // Create a counter with initial value
    const [counter] = await db.insert(countersTable)
      .values({ value: 50 })
      .returning()
      .execute();

    const resetInput: ResetCounterInput = {
      id: counter.id,
      value: -10 // Negative reset value
    };

    const result = await resetCounter(resetInput);

    // Verify the counter was reset to negative value
    expect(result.id).toEqual(counter.id);
    expect(result.value).toEqual(-10);
    expect(result.created_at).toEqual(counter.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > counter.updated_at).toBe(true);
  });
});