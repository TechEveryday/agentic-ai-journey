/**
 * Pure seeding utilities for building single-elimination brackets.
 * No I/O, no React, no mutation of inputs.
 */

/**
 * Returns the smallest power of two that is >= n.
 * nextPowerOfTwo(1) === 1, nextPowerOfTwo(3) === 4, nextPowerOfTwo(8) === 8.
 */
export function nextPowerOfTwo(n: number): number {
  let size = 1;
  while (size < n) {
    size *= 2;
  }
  return size;
}

/**
 * Standard tournament seeding order for a bracket of `size` slots (size must
 * be a power of two). Returns an array of length `size` where entry i is the
 * seed number (1-based) that should occupy round-1 slot i.
 *
 * Built recursively so that seed 1 and seed 2 can only meet in the final:
 *   order(1) = [1]
 *   order(2n) is order(n) with each seed s replaced by the pair [s, 2n+1-s]
 *
 * order(2) = [1, 2]
 * order(4) = [1, 4, 2, 3]
 * order(8) = [1, 8, 4, 5, 2, 7, 3, 6]
 */
export function getSeedOrder(size: number): number[] {
  if (size <= 0 || (size & (size - 1)) !== 0) {
    throw new Error(`getSeedOrder requires a power of two, received ${size}`);
  }

  if (size === 1) {
    return [1];
  }

  const half = getSeedOrder(size / 2);
  const order: number[] = [];
  for (const seed of half) {
    order.push(seed, size + 1 - seed);
  }
  return order;
}
