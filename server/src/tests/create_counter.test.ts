import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CreateCounterInput } from '../schema';
import { createCounter } from '../handlers/create_counter';
import { eq } from 'drizzle-orm';

// Test inputs
const defaultCounterInput: CreateCounterInput = {
  value: 0
};

const customCounterInput: CreateCounterInput = {
  value: 42
};

describe('createCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a counter with default value', async () => {
    const result = await createCounter(defaultCounterInput);

    // Basic field validation
    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a counter with custom value', async () => {
    const result = await createCounter(customCounterInput);

    // Basic field validation
    expect(result.value).toEqual(42);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a counter with Zod default value when no value provided', async () => {
    // Test Zod's default behavior - empty input should get default value 0
    const emptyInput = {} as CreateCounterInput;
    const result = await createCounter(emptyInput);

    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save counter to database', async () => {
    const result = await createCounter(customCounterInput);

    // Query using proper drizzle syntax
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(42);
    expect(counters[0].id).toEqual(result.id);
    expect(counters[0].created_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple counters with different values', async () => {
    const counter1 = await createCounter({ value: 10 });
    const counter2 = await createCounter({ value: 20 });
    const counter3 = await createCounter({ value: 0 });

    // Verify all counters have unique IDs
    expect(counter1.id).not.toEqual(counter2.id);
    expect(counter2.id).not.toEqual(counter3.id);
    expect(counter1.id).not.toEqual(counter3.id);

    // Verify correct values
    expect(counter1.value).toEqual(10);
    expect(counter2.value).toEqual(20);
    expect(counter3.value).toEqual(0);

    // Verify all are saved to database
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(3);
    
    // Verify values are stored correctly
    const values = allCounters.map(c => c.value).sort();
    expect(values).toEqual([0, 10, 20]);
  });

  it('should handle negative counter values', async () => {
    const negativeInput: CreateCounterInput = {
      value: -15
    };
    
    const result = await createCounter(negativeInput);

    expect(result.value).toEqual(-15);
    expect(result.id).toBeDefined();
    
    // Verify it's saved in database
    const savedCounter = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(savedCounter[0].value).toEqual(-15);
  });
});