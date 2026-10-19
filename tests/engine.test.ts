/** Savings bond engine: the worked examples of 31 CFR parts 351 and 359, and the rules at their edges. */
import { describe, expect, it } from 'vitest';
import { bondValue, composite, iRateAt, unitValue, value100, eeOriginalMaturity, LAST_ANNOUNCED, frozenValue } from '../src/lib/engine/bonds';
import { ym, cents } from '../src/lib/engine/ym';

describe('31 CFR 359, Series I', () => {
  it('§ 359.14: fixed 2.00 % and inflation 0.28 % give a composite of 2.57 %', () => {
    expect(composite(0.02, 0.0028)).toBe(0.0257);
  });
  it('TreasuryDirect: fixed 0.90 % and inflation 1.67 % give 4.26 % (May to October 2026)', () => {
    expect(composite(0.009, 0.0167)).toBe(0.0426);
    expect(iRateAt(ym('2026-05'), ym('2026-10'))).toBe(0.0426);
  });
  it('§ 359.12: deflation cannot push the composite below zero (May 2015, inflation −0.80 %)', () => {
    expect(composite(0, -0.008)).toBe(0);
    expect(iRateAt(ym('2015-06'), ym('2015-06'))).toBe(0); // fixed 0.00 %, first period uses May 2015
  });
  it('appendix A: $34.59 electronic I bond issued May 2001, redeemed December 2001 is worth $35.27', () => {
    const r = value100('I', ym('2001-05'), ym('2001-12'), 'paper');
    expect(r.v100).toBe(101.96);
    expect(bondValue('I', ym('2001-05'), ym('2001-12'), 'electronic', 34.59).value).toBe(35.27);
  });
  it('§ 359.19: a $25 unit at 2.57 % is worth $25.32 after six months', () => {
    expect(cents(25 * (1 + 0.0257 / 2))).toBe(25.32);
  });
  it('§ 359.7: before five years the last three months are lost, never below the price', () => {
    const issue = ym('2024-01');
    const at18 = unitValue('I', issue, issue + 18);
    expect(at18.penalty).toBe(true);
    expect(unitValue('I', issue, issue + 15).penalty).toBe(true);
    expect(unitValue('I', issue, issue + 60).penalty).toBe(false);
    expect(unitValue('I', issue, issue + 11).cashable).toBe(false);
    expect(unitValue('I', issue, issue + 12).cashable).toBe(true);
  });
  it('interest stops at 30 years: a September 1998 I bond is frozen from September 2028', () => {
    const issue = ym('1998-09');
    expect(unitValue('I', issue, issue + 360).stopped).toBe(true);
  });
});

describe('31 CFR 351, Series EE', () => {
  it('§ 351.16: a $12.50 unit at 3.25 % is worth $12.70 after six months', () => {
    expect(cents(12.5 * (1 + 0.0325 / 2))).toBe(12.7);
  });
  it('original maturity: 17 years to May 2003, 20 years from June 2003', () => {
    expect(eeOriginalMaturity(ym('2003-05'))).toBe(204);
    expect(eeOriginalMaturity(ym('2003-06'))).toBe(240);
    expect(eeOriginalMaturity(ym('2010-01'))).toBe(240);
  });
  it('the doubling: a paper $100 EE bond of May 2005 (3.50 %) is worth at least $100 at 20 years', () => {
    const r = value100('EE', ym('2005-05'), ym('2025-05'), 'paper');
    expect(r.v100).toBeGreaterThanOrEqual(100);
  });
  it('a 0.10 % EE bond of 2015 jumps to twice its price at 20 years (2035), not before', () => {
    const issue = ym('2015-06');
    const before = bondValue('EE', issue, issue + 239, 'electronic', 1000, 0.001);
    const after = bondValue('EE', issue, issue + 240, 'electronic', 1000, 0.001);
    expect(before.value!).toBeLessThan(1100);
    expect(after.value).toBe(2000);
  });
  it('electronic EE bonds are sold at face: $1,000 bought in May 2026 at 2.40 %', () => {
    const r = bondValue('EE', ym('2026-05'), ym('2027-05'), 'electronic', 1000);
    expect(r.price).toBe(1000);
    expect(r.value).toBeGreaterThan(1000);
    expect(r.penalty).toBe(true);
  });
  it('paper EE bonds were sold at half their face value', () => {
    expect(bondValue('EE', ym('2008-01'), ym('2026-10'), 'paper', 100).price).toBe(50);
  });
  it('old paper bonds are frozen at their final value from the last Treasury table', () => {
    expect(frozenValue('E', ym('1975-06'))).toBeGreaterThan(100);
    expect(frozenValue('EE', ym('1985-01'))).toBeGreaterThan(100);
  });
  it('rates are announced through the window that starts in May 2026', () => {
    expect(LAST_ANNOUNCED).toBe(ym('2026-05'));
  });
});
