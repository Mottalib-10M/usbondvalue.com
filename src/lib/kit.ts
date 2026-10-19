/**
 * Writing kit (CONTRIBUTING-PAGES.md): every figure written in a page comes from here, never typed by hand.
 *   K.P                  params-2026.json (units, limits, federal brackets, education phase-out, next I bond rate)
 *   K.R                  rates.json (I bond windows and fixed rates, EE rates), K.A auctions.json
 *   K.S(slug)            a state of data/states.json
 *   K.tool(kind, args)   runs a calculator of tool-specs.ts and returns its result card
 *   K.bond(series, issue 'YYYY-MM', month 'YYYY-MM', form, amount, project?)   one bond's value report
 *   K.irate(issue, month), K.iFixed(issue), K.composite(f, i), K.next()       I bond rates
 *   K.bill(term)         latest auction of a term; K.teq(y, f, s), K.fed(inc, st), K.stateRate(slug, inc, st)
 *   formats              K.usd, K.usd2, K.pct, K.num, K.dec, K.day, K.month
 */
import P from '../data/params-2026.json';
import R from '../data/rates.json';
import A from '../data/auctions.json';
import { STATES, STATE_SLUGS, NO_TAX, topRate } from './engine/states';
import { usd, usd2, pct, getTool, bondReport, iRateReport, nextInflation, eduExclusion, LATEST, TERMS, termLabel, BUILD_MONTH } from './tool-specs';
import { formatNumber, formatDecimal, displayDate } from './format';
import { federalMarginal, federalTax, stateMarginal, taxEquivalent, type Status } from './engine/tax';
import { composite, iFixed, eeOriginalMaturity, LAST_ANNOUNCED, NEXT_ANNOUNCEMENT, FINAL_MONTHS, ratePeriods, type Series } from './engine/bonds';
import { billBuy, priceFromDiscount, investmentRate } from './engine/tbill';
import { ym, ymStr, monthName } from './engine/ym';
import type { V } from './tool-types';

/** I bonds grouped by fixed rate: issue months [from, to], fixed rate, and the rates they earn in month `now`. */
function cohorts(now = BUILD_MONTH) {
  const t = R.i.fixedTable as Array<[string, number]>;
  const out: Array<{ from: string; to: string; fixed: number; rates: number[] }> = [];
  t.forEach(([m, f], k) => {
    const from = ym(m), to = k + 1 < t.length ? ym(t[k + 1][0]) - 1 : NEXT_ANNOUNCEMENT - 1;
    const rates = new Set<number>();
    for (let i = from; i <= to && i <= now; i++) { const r = iRateReport(i, now).rate; if (r !== undefined && now - i < FINAL_MONTHS) rates.add(r); }
    const last = out[out.length - 1];
    if (last && last.fixed === f) { last.to = ymStr(to); for (const r of rates) if (!last.rates.includes(r)) last.rates.push(r); }
    else out.push({ from: ymStr(from), to: ymStr(to), fixed: f, rates: [...rates] });
  });
  return out.map((c) => ({ ...c, rates: c.rates.sort((a, b) => a - b) }));
}
function tool(kind: string, args: V = {}) {
  const spec = getTool(kind);
  const v: V = { ...Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])), ...args };
  return spec.run(v);
}
export const KIT = {
  cohorts, P, R, A, S: (slug: string) => { const s = STATES[slug]; if (!s) throw new Error(`Unknown state ${slug}`); return s; }, STATE_SLUGS, NO_TAX, topRate, tool,
  bond: (series: Series, issue: string, month: string, form: 'paper' | 'electronic', amount: number, project = false) => bondReport(series, ym(issue), ym(month), form, amount, project),
  irate: (issue: string, month: string) => iRateReport(ym(issue), ym(month)),
  iFixed: (issue: string) => iFixed(ym(issue))!, composite, next: nextInflation, eeOM: (issue: string) => eeOriginalMaturity(ym(issue)),
  periods: (series: 'I' | 'EE', issue: string, month: string) => ratePeriods(series, ym(issue), ym(month)).map(([m, r]) => [ymStr(m), r] as [string, number]),
  LAST: ymStr(LAST_ANNOUNCED), NEXT: ymStr(NEXT_ANNOUNCEMENT), BUILD: ymStr(BUILD_MONTH), FINAL_MONTHS,
  bill: (term: string) => LATEST[term], TERMS, termLabel, billBuy, priceFromDiscount, investmentRate,
  teq: taxEquivalent, fed: (inc: number, st: Status) => federalMarginal(inc, st), fedTax: federalTax,
  stateRate: (slug: string, inc: number, st: Status, local = '') => stateMarginal(slug, inc, st, local), edu: eduExclusion,
  usd, usd2, pct, num: (x: number) => formatNumber(x, 0), dec: (x: number, d = 2) => formatDecimal(x, d), day: (iso: string) => displayDate(iso, 'en-US'),
  month: (s: string) => monthName(ym(s)),
};
export type Kit = typeof KIT;
