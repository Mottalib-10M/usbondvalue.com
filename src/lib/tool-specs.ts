/**
 * The calculators of the site, one entry per subject. Every figure comes from the engine
 * (src/lib/engine/*), which reads rates.json, auctions.json, states.json and params-2026.json.
 * A spec lists its inputs (visible first, `adv` ones folded) and a pure `run` that turns them into
 * a result card. Inputs marked `now` take the visitor's current month after mount (SpecTool).
 */
import P from '../data/params-2026.json';
import A from '../data/auctions.json';
import type { ToolSpec, V, Input, ToolOut } from './tool-types';
import { formatMoney, formatPercent, formatDecimal } from './format';
import { ym, ymOf, ymStr, monthName, monthShort, MONTH_NAMES, yearOf, cents, type YM } from './engine/ym';
import {
  bondValue, bondValueNoPenalty, unitValue, iFixed, iInflation, composite, iRateAt, eeOriginalMaturity, nextReset, ratePeriods,
  SERIES_SPAN, FINAL_MONTHS, LAST_ANNOUNCED, NEXT_ANNOUNCEMENT, FROZEN_TABLE, type Series,
} from './engine/bonds';
import { billBuy, priceFromDiscount, investmentRate, basisYear } from './engine/tbill';
import { federalMarginal, stateMarginal, taxEquivalent, type Status } from './engine/tax';
import { STATES, STATE_OPTIONS } from './engine/states';

export const usd = (x: number) => `${x < -0.005 ? '-' : ''}${formatMoney(Math.abs(Math.round(x)), 0)}`;
/** Dollars and cents: bond values are paid to the cent. */
export const usd2 = (x: number) => `${x < -0.005 ? '-' : ''}${formatMoney(Math.abs(x), 2)}`;
export const pct = (x: number, d = 2) => formatPercent(x, d);
const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k]);

/** Month of the build (first render); SpecTool moves `now` inputs to the visitor's month after mount. */
const BUILD_DAY: string = typeof __BUILD_DAY__ !== 'undefined' ? __BUILD_DAY__ : P.retrieved_at;
export const BUILD_MONTH: YM = ym(BUILD_DAY.slice(0, 7));
export const longMonth = (m: YM) => monthName(m);
const day1 = (m: YM) => `${MONTH_NAMES[m % 12]} 1, ${yearOf(m)}`;
const longDate = (iso: string) => `${MONTH_NAMES[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;

/* ---------- shared inputs ---------- */
const MONTH_OPTS = MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m }));
const years = (a: number, b: number, desc = true) => { const r = Array.from({ length: b - a + 1 }, (_, i) => String(a + i)); return (desc ? r.reverse() : r).map((y) => ({ value: y, label: y })); };
const LAST_SALE_YEAR = yearOf(NEXT_ANNOUNCEMENT - 1);
const issueM = (def: number): Input => ({ kind: 'select', id: 'im', label: 'Issue month', def: String(def), options: MONTH_OPTS, help: 'On the bond or in TreasuryDirect' });
const issueY = (def: number, from = 1941): Input => ({ kind: 'select', id: 'iy', label: 'Issue year', def: String(def), options: years(from, LAST_SALE_YEAR) });
const asM = (): Input => ({ kind: 'select', id: 'am', label: 'Value on the 1st of', def: String((BUILD_MONTH % 12) + 1), options: MONTH_OPTS, now: 'm' });
const asY = (): Input => ({ kind: 'select', id: 'ay', label: 'Year', def: String(yearOf(BUILD_MONTH)), options: years(1980, 2056, false), now: 'y' });
const STATUS: Input = { kind: 'choice', id: 'st', label: 'Filing status', def: 'single', options: [{ value: 'single', label: 'Single' }, { value: 'joint', label: 'Joint' }, { value: 'head', label: 'Head' }] };
const status = (v: V) => s(v, 'st') as Status;
const issueOf = (v: V) => ymOf(n(v, 'iy'), n(v, 'im'));
const asOf = (v: V) => ymOf(n(v, 'ay'), n(v, 'am'));
const SERIES_LABEL: Record<Series, string> = { I: 'Series I', EE: 'Series EE', E: 'Series E', SN: 'Savings note' };

/* ---------- T-bill data ---------- */
type Auction = { term: string; cusip: string; auction: string; issue: string; maturity: string; discount: number; investment: number; price: number; reopening: boolean; offering: number; accepted: number; bidToCover: number };
export const LATEST = A.latest as unknown as Record<string, Auction>;
export const TERMS = P.tbills.terms.filter((t) => LATEST[t]);
const TERM_DAYS = P.tbills.termDays as Record<string, number>;
const TERM_OPTS = TERMS.map((t) => ({ value: t, label: t.replace('-Week', ' weeks') }));
export const AUCTIONS_BUILT = A.built as string;
export const termLabel = (t: string) => t.replace('-Week', '-week');
/** Investment rate of the latest auction of a term, as a decimal. */
export const latestYield = (t: string) => LATEST[t].investment / 100;

/* ---------- bond helpers used by several calculators and by the content kit ---------- */
export interface BondReport {
  ok: boolean; reason?: string; series: Series; issue: YM; n: YM; form: 'paper' | 'electronic'; amount: number;
  value?: number; price?: number; interest?: number; rate?: number; penalty: boolean; penaltyCost: number; cashable: boolean; cashFrom: YM;
  stopped: boolean; finalMonth: YM; om?: YM; frozen?: boolean; floor?: boolean; projected: boolean;
}
/** Everything a page needs to say about one bond in month n. `project` = continue at the bond's latest known rate. */
export function bondReport(series: Series, issue: YM, n: YM, form: 'paper' | 'electronic', amount: number, project = false): BondReport {
  const [first, last] = SERIES_SPAN[series];
  // Series E issued May 1941 to November 1965 earned for 40 years, later ones for 30 (TreasuryDirect, historical bonds).
  const finalMonth = issue + (series === 'E' && issue <= ym('1965-11') ? 480 : FINAL_MONTHS);
  const base = { series, issue, n, form, amount, penalty: false, penaltyCost: 0, cashable: false, cashFrom: issue + (issue <= ym('2003-01') ? 6 : 12), stopped: n >= finalMonth, finalMonth, projected: false };
  if (issue < first || issue > last) return { ...base, ok: false, reason: issue < first ? `No ${SERIES_LABEL[series]} bond was issued before ${longMonth(first)}.` : `${SERIES_LABEL[series]} bonds stopped selling in ${longMonth(last)}.` };
  if (n < issue) return { ...base, ok: false, reason: 'The month you value the bond is before its issue month.' };
  const f: 'paper' | 'electronic' = series === 'E' || series === 'SN' ? 'paper' : form;
  let r = bondValue(series, issue, n, f, amount);
  let projected = false;
  if (r.value === undefined && project && (series === 'I' || series === 'EE')) {
    const known = ratePeriods(series, issue, Math.min(n, NEXT_ANNOUNCEMENT - 1));
    const rate = known.length ? known[known.length - 1][1] : undefined;
    if (rate !== undefined) { r = bondValue(series, issue, n, f, amount, rate); projected = true; }
  }
  if (r.value === undefined) return { ...base, form: f, ok: false, reason: `The Treasury has announced rates through ${longMonth(NEXT_ANNOUNCEMENT - 1)}. Months after that depend on rates not set yet.` };
  const om = series === 'EE' ? eeOriginalMaturity(issue) : undefined;
  let penaltyCost = 0;
  if (r.penalty && (series === 'I' || series === 'EE')) {
    const full = bondValueNoPenalty(series, issue, n, f, amount, projected ? r.rate : undefined);
    if (full !== undefined) penaltyCost = cents(full - (r.value ?? 0));
  }
  return { ...base, form: f, ok: true, value: r.value, price: r.price, interest: r.interest, rate: r.rate, penalty: r.penalty, penaltyCost, cashable: n - issue >= (issue <= ym('2003-01') ? 6 : 12), om: om === undefined ? undefined : issue + om, frozen: r.frozen, floor: r.floor, projected };
}
/** Composite rate an I bond issued in `issue` earns in month n, with its parts. */
export function iRateReport(issue: YM, n: YM) {
  const fixed = iFixed(issue);
  const start = issue + Math.floor((n - issue) / 6) * 6;
  const infl = iInflation(start);
  const known = start < NEXT_ANNOUNCEMENT;
  return { fixed, inflation: infl, rate: known ? iRateAt(issue, n) : undefined, start, next: nextReset(issue, n), known };
}
/** Next I bond composite for a given fixed rate, with the inflation part worked out from CPI-U (§ 359.11). */
export function nextInflation() {
  const x = P.nextIBond;
  if (x.inflation !== null) return { value: x.inflation as number, official: true };
  return { value: Math.round(((x.cpiSeptember - x.cpiMarch) / x.cpiMarch) * 10000) / 10000, official: false };
}

const notCashable = (r: BondReport) => `Too early to cash: a bond can be cashed from ${longMonth(r.cashFrom)}.`;
function bondOut(r: BondReport, title: string): ToolOut {
  if (!r.ok) return { label: title, value: 'n/a', sub: r.reason, rows: [] };
  const rows: Array<[string, string, number?]> = [];
  rows.push([r.form === 'paper' && r.series !== 'I' ? `Issue price (${r.series === 'EE' ? 'half' : r.series === 'E' ? 'three quarters' : '81 %'} of face value)` : 'Price paid', usd2(r.price!)]);
  rows.push(['Interest earned', usd2(r.interest!)]);
  if (r.frozen) rows.push(['Interest stopped', longMonth(r.finalMonth)]);
  else if (r.stopped) rows.push(['Stopped earning interest', longMonth(r.finalMonth)]);
  else {
    rows.push(['Rate in this period', r.rate === undefined ? 'n/a' : pct(r.rate)]);
    rows.push([r.penalty ? 'Three-month penalty already taken off' : 'Penalty', r.penalty ? usd2(r.penaltyCost) : 'none after 5 years']);
    if (r.om && r.n < r.om) rows.push(['Original maturity (value at least doubled)', longMonth(r.om)]);
    rows.push(['Final maturity (interest stops)', longMonth(r.finalMonth)]);
  }
  const sub = !r.cashable ? notCashable(r)
    : r.floor ? 'At least this much: EE bonds issued June 1993 to April 1995 earn a minimum of 4 % a year over 30 years (31 CFR 351); the Treasury stopped publishing their table in May 2023.'
    : r.frozen ? `Final value from the Treasury redemption table of ${FROZEN_TABLE.slice(0, 7) === '2023-05' ? 'May 2023' : FROZEN_TABLE}; it no longer grows.`
    : `${r.form === 'paper' ? 'Paper' : 'Electronic'} ${SERIES_LABEL[r.series]} bond issued ${longMonth(r.issue)}, value on ${day1(r.n)}${r.projected ? ' (projection at the current rate, not an official value)' : ''}.`;
  return { label: title, value: usd2(r.value!), sub, rows };
}
function monthTable(series: Series, issue: YM, from: YM, form: 'paper' | 'electronic', amount: number, count = 12): ToolOut['table'] | undefined {
  const rows: string[][] = [];
  for (let m = from; m < from + count; m++) {
    const r = bondReport(series, issue, m, form, amount);
    if (!r.ok) break;
    rows.push([monthShort(m), usd2(r.value!), usd2(r.interest!), r.cashable ? (r.penalty ? 'yes, minus 3 months' : 'yes') : 'not yet']);
    if (r.stopped) break;
  }
  return rows.length > 1 ? { caption: 'Value on the first day of each month (interest is added on the 1st)', headers: ['Month', 'Value', 'Interest', 'Cashable'], rows, align: ['l', 'r', 'r', 'l'] } : undefined;
}

export const SPECS: Record<string, (arg?: Record<string, number | string>) => ToolSpec> = {
  /* Full savings bond value calculator: paper or electronic, any month */
  bond: () => ({
    inputs: [
      { kind: 'select', id: 'sr', label: 'Series', def: 'I', options: [{ value: 'I', label: 'I bond' }, { value: 'EE', label: 'EE bond' }, { value: 'E', label: 'E bond (1941 to 1980)' }, { value: 'SN', label: 'Savings note (1967 to 1970)' }] },
      { kind: 'choice', id: 'fm', label: 'Form', def: 'electronic', options: [{ value: 'electronic', label: 'Electronic' }, { value: 'paper', label: 'Paper' }] },
      issueM(1), issueY(2022),
      { id: 'amt', label: 'Amount', def: 1000, unit: '$', max: 10000000, decimals: 2, help: 'Paper: face value. Electronic: price paid' },
      asM(), asY(),
      { kind: 'choice', id: 'pj', label: 'Months not yet announced', def: 'no', options: [{ value: 'no', label: 'Leave blank' }, { value: 'yes', label: 'Project' }], adv: true, help: 'Projection keeps the bond’s current rate; it is not an official value' },
    ],
    run: (v) => {
      const sr = s(v, 'sr') as Series, fm = s(v, 'fm') as 'paper' | 'electronic';
      const r = bondReport(sr, issueOf(v), asOf(v), fm, n(v, 'amt'), s(v, 'pj') === 'yes');
      const out = bondOut(r, 'What your bond is worth');
      if (r.ok && !r.frozen) out.table = monthTable(sr, r.issue, r.n, r.form, r.amount);
      out.note = r.ok && !r.frozen ? 'Method of 31 CFR 351 and 359, checked against every Treasury redemption table published from 1999 to 2023.' : undefined;
      return out;
    },
  }),
  /* Current rate of an I or EE bond by issue month */
  rate: (arg) => ({
    inputs: [
      { kind: 'choice', id: 'sr', label: 'Series', def: String(arg?.sr ?? 'I'), options: [{ value: 'I', label: 'I bond' }, { value: 'EE', label: 'EE bond' }] },
      issueM(3), issueY(2022, 1980), asM(), asY(),
    ],
    run: (v) => {
      const sr = s(v, 'sr') as 'I' | 'EE', issue = issueOf(v), m = asOf(v);
      const [first, last] = SERIES_SPAN[sr];
      if (issue < first || issue > last) return { label: 'Rate your bond earns', value: 'n/a', sub: issue < first ? `No ${SERIES_LABEL[sr]} bond was issued before ${longMonth(first)}.` : 'Not sold yet.', rows: [] };
      if (m < issue) return { label: 'Rate your bond earns', value: 'n/a', sub: 'Pick a month after the issue month.', rows: [] };
      if (m >= issue + FINAL_MONTHS) return { label: 'Rate your bond earns', value: '0 %', sub: `Interest stopped at final maturity, ${longMonth(issue + FINAL_MONTHS)}.`, rows: [] };
      const periods = ratePeriods(sr, issue, m);
      const cur = periods.find(([st]) => st <= m && m < st + 6);
      const rows: Array<[string, string, number?]> = [];
      if (sr === 'I') {
        const x = iRateReport(issue, m);
        rows.push(['Fixed rate (for the life of the bond)', pct(x.fixed!)]);
        if (x.inflation !== undefined && x.known) rows.push(['Inflation rate, semiannual', pct(x.inflation)]);
      } else if (issue >= ym('2005-05')) rows.push(['Fixed rate set at issue', pct(periods[0]?.[1] ?? 0)]);
      if (cur) rows.push(['Period', `${monthShort(cur[0])} to ${monthShort(cur[0] + 5)}`]);
      rows.push(['Rate changes next', longMonth(nextReset(issue, m))]);
      const om = sr === 'EE' ? eeOriginalMaturity(issue) : undefined;
      if (om && m < issue + om) rows.push(['Doubling date (original maturity)', longMonth(issue + om)]);
      const table = periods.length > 1 ? { caption: 'Every rate period of this bond so far', headers: ['Period from', 'Annual rate'], rows: periods.slice(-12).reverse().map(([st, r]) => [monthShort(st), pct(r)]), align: ['l', 'r'] as Array<'l' | 'r'> } : undefined;
      if (!cur) return { label: 'Rate your bond earns', value: 'not yet set', sub: `The rate for the period starting ${longMonth(issue + Math.floor((m - issue) / 6) * 6)} is announced ${sr === 'I' ? `on ${day1(NEXT_ANNOUNCEMENT)}` : 'with the next Treasury announcement'}.`, rows, table };
      return { label: 'Rate your bond earns', value: pct(cur[1]), sub: `${SERIES_LABEL[sr]} bond issued ${longMonth(issue)}, rate in ${longMonth(m)}.`, rows, table };
    },
  }),
  /* The November 1, 2026 I bond rate */
  inext: () => ({
    inputs: [
      { id: 'fx', label: 'Fixed rate you expect for new bonds', def: (P.nextIBond.fixed ?? iFixed(LAST_ANNOUNCED) ?? 0) * 100, unit: '%', max: 5, decimals: 2, help: 'The Treasury sets it on November 1; the current one is shown' },
      issueM(1), issueY(2022, 1998),
    ],
    run: (v) => {
      const inf = nextInflation();
      const fx = P.nextIBond.fixed !== null ? (P.nextIBond.fixed as number) : n(v, 'fx') / 100;
      const newRate = composite(fx, inf.value);
      const issue = issueOf(v);
      const yours = issue >= SERIES_SPAN.I[0] && issue < NEXT_ANNOUNCEMENT ? composite(iFixed(issue)!, inf.value) : undefined;
      const firstNew = yours === undefined ? undefined : issue + Math.ceil((NEXT_ANNOUNCEMENT - issue) / 6) * 6;
      return {
        label: inf.official ? 'I bond rate from November 1, 2026' : 'New I bonds from November 1, 2026, with this fixed rate',
        value: pct(newRate),
        sub: inf.official ? 'Announced by the Treasury.' : `Inflation part worked out from the CPI-U of March and September 2026; the Treasury announces the official rate on ${longDate(P.nextIBond.date)}.`,
        rows: [
          ['Semiannual inflation rate', pct(inf.value)],
          ['Fixed rate used', pct(fx)],
          ...(yours !== undefined ? [[`Your bond issued ${monthShort(issue)} (fixed ${pct(iFixed(issue)!)})`, pct(yours)] as [string, string]] : []),
          ...(firstNew !== undefined ? [['Your bond earns it from', day1(firstNew)] as [string, string]] : []),
        ],
        note: `CPI-U, all items, not seasonally adjusted: ${formatDecimal(P.nextIBond.cpiMarch, 3)} in March, ${formatDecimal(P.nextIBond.cpiSeptember, 3)} in September 2026 (BLS).`,
      };
    },
  }),
  /* Cash an I or EE bond now or wait for the penalty to end */
  icash: (arg) => ({
    inputs: [
      { kind: 'choice', id: 'sr', label: 'Series', def: String(arg?.sr ?? 'I'), options: [{ value: 'I', label: 'I bond' }, { value: 'EE', label: 'EE bond' }] },
      issueM(5), issueY(2023, 1997),
      { id: 'amt', label: 'Amount paid', def: 10000, unit: '$', max: 10000000, decimals: 2, wide: true },
      asM(), asY(),
    ],
    run: (v) => {
      const sr = s(v, 'sr') as 'I' | 'EE', issue = issueOf(v), m = asOf(v), amt = n(v, 'amt');
      const now = bondReport(sr, issue, m, 'electronic', amt);
      if (!now.ok) return { label: 'Cash now or wait', value: 'n/a', sub: now.reason, rows: [] };
      const free = issue + 60;
      if (!now.cashable) return { label: 'Cash now or wait', value: 'not yet', sub: notCashable(now), rows: [['Penalty ends', longMonth(free)]] };
      if (!now.penalty) return { label: 'If you cash it this month', value: usd2(now.value!), sub: 'No penalty: the bond is five years old or more.', rows: [['Interest earned', usd2(now.interest!)], ['Rate now', now.rate === undefined ? 'n/a' : pct(now.rate)], ['Final maturity', longMonth(now.finalMonth)]] };
      const later = bondReport(sr, issue, free, 'electronic', amt, true);
      return {
        label: 'If you cash it this month', value: usd2(now.value!),
        sub: `The last three months of interest (${usd2(now.penaltyCost)}) are taken off. From ${longMonth(free)} nothing is.`,
        rows: [
          ['Interest you keep', usd2(now.interest!)], ['Penalty, three months of interest', usd2(now.penaltyCost)],
          ['Rate now', now.rate === undefined ? 'n/a' : pct(now.rate)], ['Penalty ends', longMonth(free)],
          ...(later.ok ? [[`Value in ${monthShort(free)}${later.projected ? ' (at today’s rate)' : ''}`, usd2(later.value!)] as [string, string]] : []),
        ],
      };
    },
  }),
  /* EE bond doubling date */
  eedouble: () => ({
    inputs: [issueM(6), issueY(2006, 1995), { id: 'amt', label: 'Amount paid (electronic) or face value (paper)', def: 5000, unit: '$', max: 10000000, decimals: 2, wide: true },
      { kind: 'choice', id: 'fm', label: 'Form', def: 'electronic', options: [{ value: 'electronic', label: 'Electronic' }, { value: 'paper', label: 'Paper' }] }, asM(), asY()],
    run: (v) => {
      const issue = issueOf(v), fm = s(v, 'fm') as 'paper' | 'electronic', amt = n(v, 'amt');
      const om = eeOriginalMaturity(issue);
      if (issue < ym('1995-05') || issue > SERIES_SPAN.EE[1]) return { label: 'When your EE bond doubles', value: 'n/a', sub: 'The doubling guarantee covers EE bonds issued from May 1995: 17 years until May 2003, 20 years since June 2003.', rows: [] };
      const at = issue + om!;
      const r = bondReport('EE', issue, at, fm, amt);
      const now = bondReport('EE', issue, Math.min(asOf(v), at), fm, amt);
      const price = fm === 'paper' ? amt / 2 : amt;
      return {
        label: 'Your EE bond is worth at least twice its price on', value: day1(at),
        sub: `${om! / 12} years after issue. ${r.ok ? `It is then worth ${usd2(r.value!)} for ${usd2(price)} paid.` : ''}`,
        rows: [
          ['Price paid', usd2(price)], ...(r.ok ? [['Value at original maturity', usd2(r.value!)] as [string, string]] : []),
          ...(now.ok && asOf(v) < at ? [[`Value in ${monthShort(asOf(v))}`, usd2(now.value!)] as [string, string]] : []),
          ['Rate that doubling equals', pct(Math.pow(2, 1 / (om! / 12)) - 1)], ['Interest stops', longMonth(issue + FINAL_MONTHS)],
        ],
        note: issue >= ym('2005-05') ? 'EE bonds issued since May 2005 earn a fixed rate; the Treasury tops the value up to twice the price at 20 years if the rate has not done it.' : 'EE bonds of May 1995 to April 2005 earn a variable rate; the Treasury guarantees face value (paper) at original maturity.',
      };
    },
  }),
  /* I bonds versus EE bonds bought now */
  compare: () => ({
    inputs: [{ id: 'amt', label: 'Amount to invest', def: 10000, unit: '$', max: 10000, decimals: 0, wide: true, help: 'Electronic limit: $10,000 a year per person for each series' },
      { id: 'yr', label: 'Years you hold', def: 20, unit: 'yrs', max: 30 }],
    run: (v) => {
      const amt = n(v, 'amt'), yrs = Math.max(1, Math.min(30, Math.round(n(v, 'yr'))));
      const issue = LAST_ANNOUNCED + Math.min(5, Math.max(0, BUILD_MONTH - LAST_ANNOUNCED));
      const target = issue + yrs * 12;
      const iNow = iRateAt(issue, issue)!;
      const i = bondReport('I', issue, target, 'electronic', amt, true);
      const e = bondReport('EE', issue, target, 'electronic', amt, true);
      const eeRate = ratePeriods('EE', issue, issue)[0]?.[1] ?? 0;
      return {
        label: `After ${yrs} years, bought in ${longMonth(issue)}`, value: i.ok && e.ok ? (i.value! >= e.value! ? `I bond ahead by ${usd(i.value! - e.value!)}` : `EE bond ahead by ${usd(e.value! - i.value!)}`) : 'n/a',
        sub: 'The I bond line keeps today’s composite rate for every period; the real one moves with inflation every six months.',
        rows: [
          ['I bond, rate today', pct(iNow)], ['I bond value (projection)', i.ok ? usd2(i.value!) : 'n/a'],
          ['EE bond, fixed rate', pct(eeRate)], ['EE bond value', e.ok ? usd2(e.value!) : 'n/a'],
          ['EE doubles to', `${usd2(amt * 2)} at 20 years`],
        ],
      };
    },
  }),
  /* T-bill at the latest auction */
  tbill: (arg) => ({
    inputs: [{ kind: 'select', id: 'tm', label: 'Term', def: String(arg?.tm ?? '26-Week'), options: TERM_OPTS }, { id: 'face', label: 'Face value you buy', def: 10000, unit: '$', max: 10000000, help: 'Multiples of $100, from $100' }],
    run: (v) => {
      const a = LATEST[s(v, 'tm')]; const face = Math.max(100, Math.round(n(v, 'face') / 100) * 100);
      const days = TERM_DAYS[a.term] ?? 0;
      const b = { cost: Math.round(face * a.price) / 100 };
      return {
        label: `${termLabel(a.term)} bill, auction of ${longDate(a.auction)}`, value: pct(a.investment / 100, 3),
        sub: `Investment rate (bond-equivalent yield). You pay ${usd2(b.cost)} and receive ${usd(face)} on ${longDate(a.maturity)}.`,
        rows: [['Discount rate', pct(a.discount / 100, 3)], ['Price per $100', formatDecimal(a.price, 6)], ['Interest at maturity', usd2(face - b.cost)], ['Days to maturity', String(days || '')], ['Issue date', longDate(a.issue)]],
        table: { caption: `Latest auction of each term (Fiscal Data, read ${longDate(AUCTIONS_BUILT)})`, headers: ['Term', 'Auction', 'Discount', 'Investment rate', 'Price per $100'], rows: TERMS.map((t) => [termLabel(t), longDate(LATEST[t].auction), pct(LATEST[t].discount / 100, 3), pct(LATEST[t].investment / 100, 3), formatDecimal(LATEST[t].price, 6)]), align: ['l', 'l', 'r', 'r', 'r'] },
      };
    },
  }),
  /* T-bill calculator from any discount rate */
  tcalc: () => ({
    inputs: [{ id: 'd', label: 'Discount rate', def: LATEST['13-Week'].discount, unit: '%', max: 20, decimals: 3 }, { kind: 'select', id: 'tm', label: 'Term', def: '13-Week', options: TERM_OPTS },
      { id: 'face', label: 'Face value', def: 10000, unit: '$', max: 10000000, wide: true }],
    run: (v) => {
      const days = TERM_DAYS[s(v, 'tm')]; const face = Math.max(100, Math.round(n(v, 'face') / 100) * 100);
      const b = billBuy(face, n(v, 'd') / 100, days);
      return {
        label: 'Investment rate (bond-equivalent yield)', value: pct(b.investmentRate, 3),
        sub: `${days} days. You pay ${usd2(b.cost)} for ${usd(face)} at maturity.`,
        rows: [['Price per $100', formatDecimal(b.pricePer100, 6)], ['You pay', usd2(b.cost)], ['Interest', usd2(b.interest)], ['Yield if rolled at the same rate for a year', pct(b.apy, 3)]],
        note: 'Price = 100 × (1 − discount × days ÷ 360), rounded to six decimals, as in Treasury auction results. A year with a February 29 inside it uses 366 days.',
      };
    },
  }),
  /* Taxable-equivalent yield with the state schedule */
  teq: (arg) => ({
    inputs: [
      { kind: 'select', id: 'sx', label: 'State', def: String(arg?.sx ?? 'california'), options: STATE_OPTIONS },
      { id: 'inc', label: 'Taxable income', def: Number(arg?.inc ?? 120000), unit: '$', max: 10000000, help: 'After deductions; used for both federal and state brackets' },
      STATUS,
      { id: 'y', label: 'T-bill or savings bond yield', def: Number(arg?.y ?? LATEST['26-Week'].investment), unit: '%', max: 20, decimals: 3, help: `Latest 26-week auction: ${formatDecimal(LATEST['26-Week'].investment, 3)} %` },
      { kind: 'choice', id: 'nyc', label: 'New York City resident', def: String(arg?.nyc ?? 'no'), options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], showIf: { id: 'sx', is: 'new-york' } },
      { kind: 'select', id: 'pdx', label: 'Portland-area local tax', def: String(arg?.pdx ?? 'none'), options: [{ value: 'none', label: 'None' }, ...(STATES.oregon?.locals ?? []).map((l) => ({ value: l.id, label: l.label }))], showIf: { id: 'sx', is: 'oregon' } },
      { id: 'loc', label: 'Local income tax on interest', def: Number(arg?.loc ?? 0), unit: '%', max: 10, decimals: 2, adv: true, wide: true, help: 'County or city tax that reaches interest (Maryland counties, some Michigan, Ohio and Indiana localities)' },
      { kind: 'choice', id: 'it', label: 'You deduct state tax on Schedule A', def: 'no', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], adv: true, help: 'Only if you itemize and stay under the SALT cap' },
    ],
    run: (v) => {
      const slug = s(v, 'sx'), st = STATES[slug], inc = n(v, 'inc'), stt = status(v), y = n(v, 'y') / 100;
      const f = federalMarginal(inc, stt);
      const m = stateMarginal(slug, inc, stt, slug === 'new-york' && s(v, 'nyc') === 'yes' ? 'nyc' : slug === 'oregon' ? s(v, 'pdx') : '');
      const sl = m.state + m.local + n(v, 'loc') / 100;
      const eq = taxEquivalent(y, f, sl, s(v, 'it') === 'yes');
      const per = 10000;
      return {
        label: `A CD or savings account in ${st.name} must pay`, value: pct(eq, 3),
        sub: sl > 0 ? `to match ${pct(y, 3)} from a T-bill or savings bond, which ${st.name} cannot tax.` : `${st.name} does not tax this interest${st.hasIncomeTax ? '' : ' (no income tax)'}: the exemption adds nothing.`,
        rows: [
          ['Federal marginal rate (2026 brackets)', pct(f, 0)], [`${st.name} marginal rate${st.year !== 2026 ? ` (${st.year} schedule)` : ''}`, pct(m.state, 2)],
          ...(m.local + n(v, 'loc') / 100 > 0 ? [['Local rate', pct(m.local + n(v, 'loc') / 100, 3)] as [string, string]] : []),
          [`State and local tax saved per ${usd(per)} a year`, usd2(per * y * sl)],
        ],
      };
    },
  }),
  /* Federal tax on savings bond interest */
  bondtax: () => ({
    inputs: [{ id: 'int', label: 'Interest to report', def: 4000, unit: '$', max: 10000000, decimals: 2, help: 'Value when cashed minus price paid' }, { id: 'inc', label: 'Other taxable income', def: 85000, unit: '$', max: 10000000 }, STATUS,
      { kind: 'select', id: 'sx', label: 'State', def: 'new-york', options: STATE_OPTIONS, adv: true }],
    run: (v) => {
      const int = n(v, 'int'), inc = n(v, 'inc'), stt = status(v);
      const before = federalTaxOf(inc, stt), after = federalTaxOf(inc + int, stt);
      const m = stateMarginal(s(v, 'sx'), inc, stt);
      return {
        label: 'Federal income tax on this interest', value: usd(after - before),
        sub: `Taxed as ordinary income on the return for the year you report it (Form 1099-INT). ${STATES[s(v, 'sx')].name} and its localities cannot tax it.`,
        rows: [['Federal marginal rate', pct(federalMarginal(inc + int, stt), 0)], ['Share of the interest', pct(int ? (after - before) / int : 0, 1)], [`State tax a bank CD would have cost (${STATES[s(v, 'sx')].name})`, usd(int * m.state)]],
      };
    },
  }),
  /* Education exclusion, Form 8815 */
  edu: () => ({
    inputs: [
      { id: 'pr', label: 'Bonds cashed this year (principal + interest)', def: 9000, unit: '$', max: 10000000, decimals: 2, wide: true },
      { id: 'int', label: 'Of which interest', def: 3000, unit: '$', max: 10000000, decimals: 2 },
      { id: 'ex', label: 'Qualified expenses after scholarships', def: 7650, unit: '$', max: 10000000, decimals: 2 },
      { id: 'magi', label: 'Modified AGI (Form 8815 line 9)', def: 90000, unit: '$', max: 10000000 },
      { kind: 'choice', id: 'st', label: 'Filing status', def: 'joint', options: [{ value: 'joint', label: 'Joint' }, { value: 'other', label: 'Single or head' }], help: 'Married filing separately cannot use it' },
    ],
    run: (v) => {
      const r = eduExclusion(n(v, 'pr'), n(v, 'int'), n(v, 'ex'), n(v, 'magi'), s(v, 'st') as 'other' | 'joint');
      const ph = P.education.phaseOut['2026'][s(v, 'st') as 'other' | 'joint'];
      return {
        label: 'Interest you can exclude in 2026', value: usd2(r.excluded),
        sub: r.phase >= 1 ? `No exclusion: modified AGI at or above ${usd(ph[1])}.` : r.phase > 0 ? `Reduced by ${pct(r.phase, 1)} because modified AGI is above ${usd(ph[0])}.` : 'Full exclusion: modified AGI below the phase-out.',
        rows: [['Interest × expenses ÷ amount cashed', usd2(r.beforePhase)], ['Phase-out', `${usd(ph[0])} to ${usd(ph[1])}`], ['Interest still taxable', usd2(Math.max(0, n(v, 'int') - r.excluded))]],
        note: 'Only EE bonds issued after 1989 and I bonds, bought by an owner aged 24 or more, count. The Form 8815 worksheet rounds as shown on the form.',
      };
    },
  }),
  /* Who reports the interest of an inherited bond */
  inherit: () => ({
    inputs: [
      { id: 'pp', label: 'Price the owner paid', def: 500, unit: '$', max: 10000000, decimals: 2 }, { id: 'vd', label: 'Value on the date of death', def: 700, unit: '$', max: 10000000, decimals: 2 },
      { id: 'vc', label: 'Value when you cash it', def: 1000, unit: '$', max: 10000000, decimals: 2 },
      { kind: 'choice', id: 'el', label: 'Interest to the date of death', def: 'no', options: [{ value: 'no', label: 'Not reported' }, { value: 'yes', label: 'On final return' }], wide: true, help: 'The executor may report it on the owner’s final return' },
    ],
    run: (v) => {
      const pp = n(v, 'pp'), vd = Math.max(pp, n(v, 'vd')), vc = Math.max(vd, n(v, 'vc')), el = s(v, 'el') === 'yes';
      const before = cents(vd - pp), after = cents(vc - vd);
      return {
        label: 'Interest you report when you cash it', value: usd2(el ? after : before + after),
        sub: el ? 'The interest earned before death is on the owner’s final return; you report only what accrued after.' : 'Nobody reported the interest earned before death: you report all of it, as income in respect of a decedent.',
        rows: [['Interest before death', usd2(before)], ['Interest after death', usd2(after)], ['On the owner’s final return', usd2(el ? before : 0)]],
        note: 'If estate tax was paid on the bond, the heir may deduct the estate tax on that interest (Publication 550, income in respect of a decedent).',
      };
    },
  }),
  /* How much you can buy each year */
  limit: () => ({
    inputs: [{ id: 'pp', label: 'Adults with their own account', def: 2, unit: '', max: 20 }, { id: 'kids', label: 'Children (minor accounts)', def: 0, unit: '', max: 20 },
      { id: 'ent', label: 'Trusts or businesses with a tax ID', def: 0, unit: '', max: 20 }],
    run: (v) => {
      const owners = n(v, 'pp') + n(v, 'kids') + n(v, 'ent');
      const i = owners * P.bonds.annualLimitElectronicI, e = owners * P.bonds.annualLimitElectronicEE;
      return {
        label: 'Electronic savings bonds you can buy in one calendar year', value: usd(i + e),
        sub: `${usd(P.bonds.annualLimitElectronicI)} of I bonds and ${usd(P.bonds.annualLimitElectronicEE)} of EE bonds per Social Security number or employer ID.`,
        rows: [['I bonds', usd(i)], ['EE bonds', usd(e)], ['Owners counted', String(owners)]],
        note: 'A gift bond counts against the limit of the person who receives it, in the year it is delivered to them.',
      };
    },
  }),
};

function federalTaxOf(inc: number, st: Status) { return federalTaxFn(inc, st); }
import { federalTax as federalTaxFn } from './engine/tax';
/** Education exclusion of Form 8815 (Publication 970): interest × expenses ÷ proceeds, then the 2026 phase-out. */
export function eduExclusion(proceeds: number, interest: number, expenses: number, magi: number, st: 'other' | 'joint', year: '2026' | '2025' = '2026') {
  const ratio = proceeds > 0 ? Math.min(1, expenses / proceeds) : 0;
  const beforePhase = cents(interest * ratio);
  const [lo, hi] = P.education.phaseOut[year][st];
  const phase = magi <= lo ? 0 : magi >= hi ? 1 : Math.round(((magi - lo) / (hi - lo)) * 1000) / 1000;
  return { beforePhase, phase, excluded: cents(beforePhase * (1 - phase)) };
}

export function getTool(kind: string, arg?: Record<string, number | string>): ToolSpec {
  const f = SPECS[kind];
  if (!f) throw new Error(`Unknown calculator ${kind}`);
  const spec = f(arg);
  if (!arg) return spec;
  return { ...spec, inputs: spec.inputs.map((i) => (arg[i.id] === undefined ? i : { ...i, def: (typeof i.def === 'number' ? Number(arg[i.id]) : String(arg[i.id])) as never })) };
}
export const TOOL_KINDS = Object.keys(SPECS);
export { investmentRate, priceFromDiscount, basisYear, unitValue, ymStr };
