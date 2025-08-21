import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounters } from '../handlers/get_counters';

describe('getCounters', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no counters exist', async () => {
    const result = await getCounters();

    expect(result).toEqual([]);
  });

  it('should return all counters from database', async () => {
    // Create test counters
    await db.insert(countersTable)
      .values([
        { value: 5 },
        { value: 10 },
        { value: 0 }
      ])
      .execute();

    const result = await getCounters();

    expect(result).toHaveLength(3);
    
    // Check that all required fields are present
    result.forEach(counter => {
      expect(counter.id).toBeDefined();
      expect(typeof counter.value).toBe('number');
      expect(counter.created_at).toBeInstanceOf(Date);
      expect(counter.updated_at).toBeInstanceOf(Date);
    });

    // Check specific values
    const values = result.map(c => c.value).sort((a, b) => a - b);
    expect(values).toEqual([0, 5, 10]);
  });

  it('should return counters with correct data types', async () => {
    // Insert a counter with specific value
    await db.insert(countersTable)
      .values({ value: 42 })
      .execute();

    const result = await getCounters();

    expect(result).toHaveLength(1);
    const counter = result[0];
    
    expect(typeof counter.id).toBe('number');
    expect(typeof counter.value).toBe('number');
    expect(counter.value).toEqual(42);
    expect(counter.created_at).toBeInstanceOf(Date);
    expect(counter.updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple counters with different values', async () => {
    // Create counters with various values including negative
    await db.insert(countersTable)
      .values([
        { value: -5 },
        { value: 0 },
        { value: 100 },
        { value: 1 }
      ])
      .execute();

    const result = await getCounters();

    expect(result).toHaveLength(4);
    
    // Verify all counters are returned
    const values = result.map(c => c.value).sort((a, b) => a - b);
    expect(values).toEqual([-5, 0, 1, 100]);
    
    // Verify all have proper timestamps
    result.forEach(counter => {
      expect(counter.created_at).toBeInstanceOf(Date);
      expect(counter.updated_at).toBeInstanceOf(Date);
    });
  });
});