/**
 * Savings bond values, rebuilt from the Treasury's valuation rules (31 CFR parts 351 and 359).
 *
 *  - Values are computed on a base unit, then scaled: a $25 Series I unit (§ 359.19) and a
 *    $12.50-principal Series EE unit (§ 351.16). A paper bond of face F is (F ÷ unit face) units;
 *    an electronic bond's value is its principal ÷ 100 × the value of a $100 bond, rounded to the
 *    cent (§§ 351.70, 359.55).
 *  - Each semiannual period starts on the issue month and every sixth month after it. The value at
 *    the start of a period (PV) is carried rounded to the cent; within a period the value on the
 *    first of each month is PV × (1 + rate ÷ 2)^(m ÷ 6), rounded to the cent (§§ 351.32, 359.39).
 *  - Before 5 years, the value is the one three months earlier, never below the price paid
 *    (§§ 351.31, 351.35(e), 359.7). Nothing can be cashed before 12 months (6 months for bonds
 *    issued through January 2003). Interest stops 30 years after issue.
 *  - Series I rate for a period: fixed rate of the issue month + semiannual inflation rate of the
 *    latest announcement at or before the period start; composite = fixed + 2 × inflation +
 *    fixed × inflation, rounded to 0.01 %, never below 0 (§ 359.14).
 *  - Series EE: fixed rate since May 2005; the savings bonds rate of each period for May 1997 to
 *    April 2005; short-term then long-term rates, credited every 6 months, for May 1995 to April
 *    1997. At original maturity a bond is worth at least its face value (paper) or twice its price
 *    (electronic).
 *  - Older paper bonds (Series E, EE issued before May 1995, savings notes) stopped earning interest
 *    before today: their value is frozen, and we take it from the Treasury's last redemption table
 *    (see data/frozen.json).
 */
import R from '../../data/rates.json';
import FROZEN from '../../data/frozen.json';
import { ym, ymStr, at, cents, bp, type YM } from './ym';

type Pair = [string, number];
const I_FIXED = R.i.fixedTable as Pair[];
const I_INFL: Pair[] = R.i.windows.map((w) => [w.from, w.inflation] as Pair);
const EE2005 = R.ee2005 as Pair[];
const EE1997 = R.ee1997 as Pair[];
const EE95S = R.ee1995Short as Pair[];
const EE95L = R.ee1995Long as Pair[];

export type Series = 'I' | 'EE' | 'E' | 'SN';
export const FIRST_I = ym('1998-09');
export const FIRST_EE = ym('1980-01');
/** Last month whose rates are announced: values can be computed up to the end of the periods that started by then. */
export const LAST_ANNOUNCED = Math.max(ym(I_INFL[I_INFL.length - 1][0]), ym(EE1997[EE1997.length - 1][0]));
export const FINAL_MONTHS = 360;
/** First month whose rate is not announced yet (the next May 1 or November 1). */
export const NEXT_ANNOUNCEMENT = LAST_ANNOUNCED + 6;

/** Fixed rate of an I bond issued in month `issue` (undefined before September 1998). */
export const iFixed = (issue: YM) => at(I_FIXED, issue);
/** Semiannual inflation rate announced at or before month n. */
export const iInflation = (n: YM) => at(I_INFL, n);
/** Composite annual rate from a fixed rate and a semiannual inflation rate (§ 359.14). */
export function composite(fixed: number, inflation: number) {
  return Math.max(0, bp(fixed + 2 * inflation + fixed * inflation));
}
/** Composite rate earned by an I bond issued in `issue` during the period that contains month n. */
export function iRateAt(issue: YM, n: YM): number | undefined {
  const start = issue + Math.floor((n - issue) / 6) * 6;
  const f = iFixed(issue), i = iInflation(start);
  return f === undefined || i === undefined ? undefined : composite(f, i);
}

interface Period { start: YM; rate: number; pv: number }
export interface Path { unitFace: number; unitPrice: number; periods: Period[]; monthly: boolean; maturity: number }

/** Rate of a Series EE bond for the period starting at month `start`. */
function eeRate(issue: YM, start: YM): number | undefined {
  if (issue >= ym('2005-05')) return at(EE2005, issue);
  if (issue >= ym('1997-05')) return at(EE1997, start);
  if (issue >= ym('1995-05')) return start - issue < 60 ? at(EE95S, start) : at(EE95L, start);
  return undefined;
}
/** Original maturity in months (face value guaranteed then). */
export function eeOriginalMaturity(issue: YM) {
  if (issue >= ym('2003-06')) return 240;
  if (issue >= ym('1995-05')) return 204;
  return undefined;
}

/**
 * Builds the semiannual path of one unit. `through` = last month needed. Periods whose rate is not
 * announced yet are left out unless `assume` gives a rate for them (projection, labelled as such).
 */
export function path(series: 'I' | 'EE', issue: YM, through: YM, assume?: number): Path {
  const unitFace = 25, unitPrice = series === 'I' ? 25 : 12.5;
  const monthly = !(series === 'EE' && issue < ym('1997-05'));
  const om = series === 'EE' ? eeOriginalMaturity(issue) : undefined;
  const periods: Period[] = [];
  let pv = unitPrice;
  for (let start = issue; start <= Math.min(through, issue + FINAL_MONTHS - 1); start += 6) {
    let rate = series === 'I' ? iRateAt(issue, start) : eeRate(issue, start);
    const fixedForLife = series === 'EE' && issue >= ym('2005-05');
    if (rate === undefined || (!fixedForLife && start >= NEXT_ANNOUNCEMENT)) { if (assume === undefined) break; rate = assume; }
    if (om !== undefined && start - issue === om && pv < unitFace) pv = unitFace;
    periods.push({ start, rate, pv });
    pv = monthly ? cents(pv * (1 + rate / 2)) : cents(pv + cents(pv * rate / 2));
  }
  return { unitFace, unitPrice, periods, monthly, maturity: issue + FINAL_MONTHS };
}

/** Unit value on the first day of month n, without the early-redemption penalty. undefined = rate unknown. */
export function unitValueRaw(p: Path, issue: YM, n: YM): number | undefined {
  const t = Math.min(n, issue + FINAL_MONTHS);
  if (t <= issue) return p.unitPrice;
  const k = Math.floor((t - issue) / 6), m = (t - issue) % 6;
  const per = p.periods[k];
  if (!per) {
    // exactly at the end of the last known period (e.g. final maturity)
    const last = p.periods[k - 1];
    if (last && m === 0) { const v = p.monthly ? cents(last.pv * (1 + last.rate / 2)) : cents(last.pv + cents(last.pv * last.rate / 2)); return v; }
    return undefined;
  }
  if (!p.monthly || m === 0) return per.pv;
  return cents(per.pv * Math.pow(1 + per.rate / 2, m / 6));
}

export interface UnitValue { value?: number; penalty: boolean; cashable: boolean; stopped: boolean; frozen?: boolean; rate?: number; floor?: boolean; lastTable?: { table: string; v100: number } }
/** Unit value as a bank or TreasuryDirect pays it in month n. */
export function unitValue(series: Series, issue: YM, n: YM, assume?: number): UnitValue {
  const stopped = n >= issue + FINAL_MONTHS;
  if (series === 'E' || series === 'SN' || (series === 'EE' && issue < ym('1995-05'))) {
    const v = frozenValue(series, issue);
    if (v !== undefined) return { value: v / 4, penalty: false, cashable: true, stopped: true, frozen: true };
    const part = (FROZEN.partial as Record<string, { table: string; v100: number }>)[`${series}|${ymStr(issue)}`];
    if (part) {
      // EE issued June 1993 to April 1995: final maturity after the last Treasury table (May 2023).
      // § 351.21: at least 4 % a year compounded semiannually over the 30 years.
      return { value: cents(12.5 * Math.pow(1.02, 60)), penalty: false, cashable: true, stopped: n >= issue + FINAL_MONTHS, frozen: true, floor: true, lastTable: part };
    }
    return { value: undefined, penalty: false, cashable: true, stopped: true, frozen: true };
  }
  const minHold = issue <= ym('2003-01') ? 6 : 12;
  const cashable = n - issue >= minHold;
  const p = path(series, issue, n, assume);
  const early = n - issue < 60 && issue >= ym('1997-05');
  const raw = unitValueRaw(p, issue, early ? n - 3 : n);
  const value = raw === undefined ? undefined : Math.max(raw, p.unitPrice);
  const per = p.periods[Math.floor((Math.min(n, issue + FINAL_MONTHS - 1) - issue) / 6)];
  return { value, penalty: early, cashable, stopped, rate: stopped ? 0 : per?.rate };
}

/** Value of a $100 face bond (paper) or $100 of principal (electronic). */
export function value100(series: Series, issue: YM, n: YM, form: 'paper' | 'electronic', assume?: number) {
  const u = unitValue(series, issue, n, assume);
  if (u.value === undefined) return { ...u, v100: undefined };
  // Paper: $100 face = 4 units of $25 face. Electronic EE: $100 principal = 8 units of $12.50; I: 4 units of $25.
  const units = form === 'paper' ? 4 : series === 'EE' ? 8 : 4;
  return { ...u, v100: cents(u.value * units) };
}

/**
 * Value of one bond. Paper: `amount` is the face value printed on the bond. Electronic: `amount` is
 * the principal paid (any amount to the cent, minimum $25).
 */
export function bondValue(series: Series, issue: YM, n: YM, form: 'paper' | 'electronic', amount: number, assume?: number) {
  const r = value100(series, issue, n, form, assume);
  if (r.v100 === undefined) return { ...r, value: undefined, price: undefined, interest: undefined };
  const value = form === 'paper' ? cents(r.v100 * amount / 100) : cents(amount / 100 * r.v100);
  const price = form === 'paper' ? cents(amount * PAPER_PRICE[series]) : amount;
  return { ...r, value, price, interest: cents(value - price) };
}

/** Frozen final value of a $100 face bond that no longer earns interest (Treasury table, May 2023). */
export function frozenValue(series: Series, issue: YM): number | undefined {
  const key = `${series}|${ymStr(issue)}`;
  return (FROZEN.values as Record<string, number>)[key];
}
export const FROZEN_TABLE = FROZEN.table as string;
/** Issue price of a paper bond as a share of its face value: I at face, EE at half, E at three quarters, savings notes at 81 %. */
export const PAPER_PRICE: Record<Series, number> = { I: 1, EE: 0.5, E: 0.75, SN: 0.81 };

/** Value of one bond in month n as if no penalty applied (to show what the 3-month penalty costs). */
export function bondValueNoPenalty(series: 'I' | 'EE', issue: YM, n: YM, form: 'paper' | 'electronic', amount: number, assume?: number) {
  const p = path(series, issue, n, assume);
  const raw = unitValueRaw(p, issue, n);
  if (raw === undefined) return undefined;
  const units = form === 'paper' ? 4 : series === 'EE' ? 8 : 4;
  const v100 = cents(Math.max(raw, p.unitPrice) * units);
  return form === 'paper' ? cents(v100 * amount / 100) : cents(amount / 100 * v100);
}
/** First and last months a series was sold (paper E from May 1941; savings notes 1967 to 1970). */
export const SERIES_SPAN: Record<Series, [YM, YM]> = {
  E: [ym('1941-05'), ym('1980-06')], SN: [ym('1967-05'), ym('1970-10')], EE: [ym('1980-01'), NEXT_ANNOUNCEMENT - 1], I: [FIRST_I, NEXT_ANNOUNCEMENT - 1],
};
/** Months since issue at which the bond's composite or EE rate changes next (every six months from issue). */
export const nextReset = (issue: YM, n: YM) => issue + (Math.floor((n - issue) / 6) + 1) * 6;
/** Rate periods of an I or EE bond from issue through month n: [start month, annual rate]. */
export function ratePeriods(series: 'I' | 'EE', issue: YM, n: YM) {
  return path(series, issue, n).periods.map((p) => [p.start, p.rate] as [YM, number]);
}
