import { describe, it, expect } from 'vitest';
import { cn, formatPrice, isLowStock, isOutOfStock } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
  });

  it('resolves tailwind conflicts — last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy values', () => {
    expect(cn('px-2', false, undefined, null, 'py-2')).toBe('px-2 py-2');
  });

  it('handles conditional classes', () => {
    const active = true;
    expect(cn('base', active && 'active')).toBe('base active');
    expect(cn('base', !active && 'active')).toBe('base');
  });
});

describe('formatPrice', () => {
  it('formats whole dollar amounts', () => {
    expect(formatPrice(1000)).toBe('$10.00');
  });

  it('formats cents correctly', () => {
    expect(formatPrice(199)).toBe('$1.99');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats large amounts', () => {
    expect(formatPrice(100000)).toBe('$1,000.00');
  });

  it('formats with alternate currency', () => {
    expect(formatPrice(1000, 'EUR', 'de-DE')).toMatch(/10,00/);
  });
});

describe('isLowStock', () => {
  it('returns true when quantity is at threshold', () => {
    expect(isLowStock(5, 5)).toBe(true);
  });

  it('returns true when quantity is below threshold', () => {
    expect(isLowStock(2, 5)).toBe(true);
  });

  it('returns false when quantity is above threshold', () => {
    expect(isLowStock(10, 5)).toBe(false);
  });

  it('returns false when quantity is zero (out of stock, not low)', () => {
    expect(isLowStock(0, 5)).toBe(false);
  });
});

describe('isOutOfStock', () => {
  it('returns true when quantity is zero', () => {
    expect(isOutOfStock(0)).toBe(true);
  });

  it('returns true when quantity is negative', () => {
    expect(isOutOfStock(-1)).toBe(true);
  });

  it('returns false when quantity is positive', () => {
    expect(isOutOfStock(1)).toBe(false);
  });
});
