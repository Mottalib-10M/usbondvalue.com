/**
 * Income tax pieces the calculators need: the 2026 federal marginal rate (Rev. Proc. 2025-32), the
 * state marginal rate from data/states.json, and the taxable-equivalent yield of interest that is
 * exempt from state and local income tax (Treasury bills, savings bonds: 31 U.S.C. 3124).
 */
import P from '../../data/params-2026.json';
import { STATES, type StateRow } from './states';

export type Status = 'single' | 'joint' | 'head';
type Brackets = Array<[number, number]>;

/** Rate of the bracket that contains `income` (thresholds are where each rate starts). */
export function marginal(br: Brackets, income: number): number {
  let r = 0;
  for (const [lo, rate] of br) { if (income >= lo) r = rate; else break; }
  return r;
}
/** Tax on `income` with a bracket schedule. */
export function bracketTax(br: Brackets, income: number): number {
  let t = 0;
  for (let i = 0; i < br.length; i++) {
    const lo = br[i][0], hi = i + 1 < br.length ? br[i + 1][0] : Infinity;
    if (income > lo) t += (Math.min(income, hi) - lo) * br[i][1];
  }
  return t;
}
export const federalBrackets = (st: Status) => P.tax.brackets[st] as Brackets;
export const federalMarginal = (taxable: number, st: Status) => marginal(federalBrackets(st), Math.max(0, taxable));
export const federalTax = (taxable: number, st: Status) => bracketTax(federalBrackets(st), Math.max(0, taxable));

/** State schedule for a filing status: head of household uses the state's single schedule unless it publishes one. */
export function stateBrackets(s: StateRow, st: Status): Brackets {
  if (!s.hasIncomeTax || !s.taxesInterest) return [];
  const b = s.brackets as Record<string, Brackets | undefined>;
  return (st === 'joint' ? b.joint : (st === 'head' ? b.head ?? b.single : b.single)) ?? [];
}
/** State marginal rate on one more dollar of interest, plus a local rate if the state row carries one. */
export function stateMarginal(slug: string, taxable: number, st: Status, local = ''): { state: number; local: number } {
  const s = STATES[slug];
  if (!s) throw new Error(`Unknown state ${slug}`);
  const state = marginal(stateBrackets(s, st), Math.max(0, taxable));
  let loc = 0;
  const L = s.locals?.find((l) => l.id === local);
  if (L) loc = L.brackets ? marginal((st === 'joint' ? L.brackets.joint : L.brackets.single) as Brackets, taxable) : L.rate ?? 0;
  return { state, local: loc };
}

/**
 * Yield a fully taxable investment (CD, savings account, corporate bond) must pay to leave as much
 * after tax as a yield `y` that is exempt from state and local tax but taxed federally.
 * Without itemizing: r × (1 − f − s) = y × (1 − f). If state tax is deducted on Schedule A
 * (below the SALT cap), each dollar of state tax lowers federal tax by f: r = y ÷ (1 − s).
 */
export function taxEquivalent(y: number, f: number, s: number, itemize = false) {
  if (s <= 0) return y;
  return itemize ? y / (1 - s) : y * (1 - f) / (1 - f - s);
}
