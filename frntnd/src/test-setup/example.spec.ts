import { describe, it, expect } from 'vitest';

function sum(a: number, b: number) {
  return a + b;
}

describe('sum util', () => {
  it('adds numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
