/**
 * The engine against the Treasury's own redemption tables: every value of a $100 face Series I or
 * Series EE (issued May 1995 or later) bond in the 291 monthly tables published from March 1999 to
 * May 2023 (tests/fixtures/oracle.json, built by scripts/data/build-oracle.py from Fiscal Data).
 */
import { describe, expect, it } from 'vitest';
import O from './fixtures/oracle.json';
import { value100 } from '../src/lib/engine/bonds';
import { ym, ymStr } from '../src/lib/engine/ym';

const series = O.series as Record<string, { from: string; v: Array<number | null> }>;
function compare() {
  let n = 0, ok = 0, maxDiff = 0; const bad: string[] = [];
  for (const [k, o] of Object.entries(series)) {
    const [s, issue] = k.split('|') as ['I' | 'EE', string];
    o.v.forEach((x, i) => {
      if (x === null) return;
      const red = ym(o.from) + i;
      const r = value100(s, ym(issue), red, 'paper');
      n++;
      const d = r.v100 === undefined ? Infinity : Math.abs(r.v100 - x);
      if (d < 0.005) ok++; else { if (bad.length < 40) bad.push(`${k} @ ${ymStr(red)}: table ${x}, engine ${r.v100}`); }
      if (Number.isFinite(d)) maxDiff = Math.max(maxDiff, d);
    });
  }
  return { n, ok, maxDiff, bad };
}
describe('Treasury redemption tables 1999-2023', () => {
  const r = compare();
  it(`matches every published value to the cent (${r.ok} of ${r.n})`, () => {
    expect(r.bad, r.bad.join('\n')).toEqual([]);
    expect(r.n).toBeGreaterThan(90000);
  });
});
