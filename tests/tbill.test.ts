/** Treasury bill formulas against 652 auctions of 2023-2024 (Fiscal Data), leap year 2024 included. */
import { describe, expect, it } from 'vitest';
import FX from './fixtures/bills-2023-2024.json';
import { priceFromDiscount, investmentRate, basisYear, daysBetween, billBuy } from '../src/lib/engine/tbill';

describe('T-bill price and investment rate', () => {
  const rows = FX as Array<{ term: string; issue: string; maturity: string; discount: number; investment: number; price: number }>;
  it(`reproduces the price and the investment rate of all ${rows.length} auctions`, () => {
    const bad: string[] = [];
    for (const r of rows) {
      const t = daysBetween(r.issue, r.maturity);
      const p = priceFromDiscount(r.discount / 100, t);
      const i = Math.round(investmentRate(p, t, basisYear(r.issue)) * 100 * 1000 + 1e-6) / 1000;
      if (Math.abs(p - r.price) > 1e-6 || Math.abs(i - r.investment) > 0.0005) bad.push(`${r.term} ${r.issue}: ${p}/${i} vs ${r.price}/${r.investment}`);
    }
    expect(rows.length).toBeGreaterThan(600);
    expect(bad).toEqual([]);
  });
  it('a 2026 bill: 52-week of September 29, 2026 at 4.400 % discount', () => {
    const b = billBuy(1000, 0.044, 364, '2026-10-01');
    expect(b.pricePer100).toBeCloseTo(95.551111, 6);
    expect(Math.round(b.investmentRate * 100000) / 1000).toBe(4.616);
    expect(b.cost).toBe(955.51);
  });
  it('the basis year turns 366 only when a February 29 falls within twelve months of issue', () => {
    expect(basisYear('2027-03-04')).toBe(366);
    expect(basisYear('2026-10-20')).toBe(365);
    expect(basisYear('2028-02-29')).toBe(365);
  });
});
