import { describe, it, expect } from 'vitest';
import { calculateCartTotals } from '../utils/cart.js';

describe('calculateCartTotals', () => {
  it('calculates totals correctly', () => {
    const totals = calculateCartTotals([
      { price: 100, qty: 2 },
      { price: 50, qty: 1 }
    ]);

    expect(totals.itemsPrice).toBe(250);
    expect(totals.taxPrice).toBe(12.5);
    expect(totals.totalPrice).toBe(321.5);
  });
});
