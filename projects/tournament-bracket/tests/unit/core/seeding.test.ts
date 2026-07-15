import { describe, it, expect } from 'vitest';
import { nextPowerOfTwo, getSeedOrder } from '@/core/seeding';

describe('nextPowerOfTwo', () => {
  it('should return 1 for n = 1', () => {
    expect(nextPowerOfTwo(1)).toBe(1);
  });

  it('should return the same value when n is already a power of two', () => {
    expect(nextPowerOfTwo(2)).toBe(2);
    expect(nextPowerOfTwo(4)).toBe(4);
    expect(nextPowerOfTwo(8)).toBe(8);
    expect(nextPowerOfTwo(16)).toBe(16);
  });

  it('should round up to the next power of two', () => {
    expect(nextPowerOfTwo(3)).toBe(4);
    expect(nextPowerOfTwo(5)).toBe(8);
    expect(nextPowerOfTwo(6)).toBe(8);
    expect(nextPowerOfTwo(7)).toBe(8);
    expect(nextPowerOfTwo(9)).toBe(16);
    expect(nextPowerOfTwo(15)).toBe(16);
  });

  it('should return 1 for n = 0 (size still valid as a power of two)', () => {
    expect(nextPowerOfTwo(0)).toBe(1);
  });
});

describe('getSeedOrder', () => {
  it('should return [1] for size 1', () => {
    expect(getSeedOrder(1)).toEqual([1]);
  });

  it('should return the exact standard seeding order for size 2', () => {
    expect(getSeedOrder(2)).toEqual([1, 2]);
  });

  it('should return the exact standard seeding order for size 4', () => {
    expect(getSeedOrder(4)).toEqual([1, 4, 2, 3]);
  });

  it('should return the exact standard seeding order for size 8', () => {
    expect(getSeedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it('should return the exact standard seeding order for size 16', () => {
    expect(getSeedOrder(16)).toEqual([
      1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11,
    ]);
  });

  it('should ensure seed 1 and seed 2 can only meet in the final for size 8', () => {
    const order = getSeedOrder(8);
    const half = order.length / 2;
    const firstHalf = order.slice(0, half);
    const secondHalf = order.slice(half);

    // Seed 1 and seed 2 must land in opposite halves of the bracket so they
    // can only meet in the final.
    expect(firstHalf.includes(1)).toBe(true);
    expect(secondHalf.includes(2)).toBe(true);
  });

  it('should throw for a non power-of-two size', () => {
    expect(() => getSeedOrder(3)).toThrow();
    expect(() => getSeedOrder(5)).toThrow();
    expect(() => getSeedOrder(0)).toThrow();
  });

  it('should produce a permutation of 1..size with no duplicates', () => {
    for (const size of [2, 4, 8, 16]) {
      const order = getSeedOrder(size);
      const sorted = [...order].sort((a, b) => a - b);
      expect(sorted).toEqual(Array.from({ length: size }, (_, i) => i + 1));
    }
  });
});
