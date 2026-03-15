import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats integer cents to a locale-aware currency string.
 * Always use this — never divide by 100 inline.
 */
export function formatPrice(cents: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Returns true if product stock is at or below threshold */
export function isLowStock(quantity: number, threshold: number): boolean {
  return quantity > 0 && quantity <= threshold;
}

/** Returns true if product is out of stock */
export function isOutOfStock(quantity: number): boolean {
  return quantity <= 0;
}
