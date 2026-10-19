import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'california';
const S = K.S(SL);
const b26 = K.bill('26-Week');
const y = b26.investment / 100;
/** Percent with only the decimals the rate needs (9.3 %, 12.3 %, 1 %). */
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const one = (inc: number, st: 'single' | 'joint') => {
  const f = K.fed(inc, st), s = K.stateRate(SL, inc, st).state;
  return { f, s, eq: K.teq(y, f, s), saved: 10000 * y * s };
};
const INC = 150000;
const main = one(INC, 'single');
const sg = S.brackets.single, jt = S.brackets.joint;
// The wide 9.3 % band, read from the schedule.
const k93s = sg.findIndex((x) => x[1] === 0.093), k93j = jt.findIndex((x) => x[1] === 0.093);
const band = { s: [sg[k93s][0], sg[k93s + 1][0]], j: [jt[k93j][0], jt[k93j + 1][0]] };
const top = sg[sg.length - 1];
const r93 = sg[k93s][1];
const highest = K.STATE_SLUGS.every((x) => K.topRate(x) <= K.topRate(SL));
// The Mental Health Services Tax starts at the same threshold for every status: find it in the joint schedule.
const mhsAt = sg[sg.length - 1][0];
const jAt = jt.find((x) => x[0] === mhsAt)!;
const jBelow = jt[jt.indexOf(jAt) - 1];
const mhs = jAt[1] - jBelow[1];
const low = one(60000, 'single'), high = one(520000, 'single');
const rows = sg.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), K.usd(jt[i][0])]);

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: California State Tax Saved',
  description: `California taxes CD interest up to ${rp(top[1])} but never T-bill or savings bond interest. At ${K.usd(INC)}, a CD needs ${K.pct(main.eq, 3)} to match the latest 26-week bill in 2026.`,
  intro: `California cannot tax the interest on Treasury bills or savings bonds, and with brackets that climb to ${rp(top[1])} the exemption is worth more here than almost anywhere.`,
  resume: `A single Californian with ${K.usd(INC)} of taxable income pays ${rp(main.s)} to the state on each extra dollar of bank interest, on top of a ${K.pct(main.f, 0)} federal rate. The 26-week Treasury bill auctioned on ${K.day(b26.auction)} yields ${K.pct(y, 3)}, and that interest is outside California income tax by federal law. To leave as much after both taxes, a certificate of deposit or high-yield savings account would have to pay ${K.pct(main.eq, 3)}. Put differently, every ${K.usd(10000)} held in T-bills or savings bonds for a year at that yield keeps ${K.usd2(main.saved)} of state tax in your pocket. The rates come from the ${S.year} California schedule, because the Franchise Tax Board had not published its indexed 2026 schedule when we read it; the thresholds will move up a little once it does, the rates will not. The ${rp(mhs)} Mental Health Services Tax on income above ${K.usd(mhsAt)} is already built into the top brackets shown below.`,
  body: (h) => `
<h2>Ten brackets from the ${S.year} Form 540 booklet</h2>
<p>California publishes separate schedules for single filers and for married couples filing jointly. The joint thresholds are close to twice the single ones, so a couple rarely pays a higher rate than a single person with half the income. The table gives the point where each rate begins. Only the last dollar of interest matters for a comparison with a CD, so find the row your taxable income falls in and read the rate on its left.</p>
${h.table(['Rate', 'Single, from', 'Married filing jointly, from'], rows, `California personal income tax brackets, tax year ${S.year} (Franchise Tax Board rate schedules). The 2026 indexed schedule had not been released when this page was built.`, ['l', 'r', 'r'])}
<p>Why ${S.year}? The Franchise Tax Board indexes its thresholds each year for inflation, and its 2026 schedule was still not posted when we checked on ${K.day(S.retrieved)}. Until it is, the latest published schedule is the honest reference. Indexing moves the thresholds by a few percent and leaves the rates unchanged, so for most incomes the marginal rate, the only figure the comparison uses, stays the same.</p>

<h2>The long ${rp(r93)} band</h2>
<p>Most savers with a comfortable income land in the same row. For a single filer the ${rp(r93)} rate runs from ${K.usd(band.s[0])} all the way to ${K.usd(band.s[1])}; on a joint return it covers ${K.usd(band.j[0])} to ${K.usd(band.j[1])}. That stretch is unusually wide, which means a nurse, an engineer and a retired couple living on a pension can all face the same state rate on their bank interest. For each of them the federal exemption of Treasury interest from state tax (31 U.S.C. 3124, ${h.src('usc_3124', 'U.S. Code')}) removes the same slice of tax.</p>

<h2>One million dollars and the Mental Health Services Tax</h2>
<p>California adds ${rp(mhs)} on taxable income above ${K.usd(mhsAt)}, whatever the filing status. In the single schedule it creates the last row, ${rp(top[1])}. In the joint schedule it lands inside a bracket: the ${rp(jBelow[1])} rate becomes ${rp(jAt[1])} at ${K.usd(mhsAt)}. ${highest ? `With it, California has the highest top rate of the 50 states and the District of Columbia in our table.` : ''} For a household at that level, every ${K.usd(10000)} of T-bill interest instead of CD interest at ${K.pct(y, 3)} avoids ${K.usd2(10000 * y * top[1])} of state tax.</p>

<h2>Two Californians, two answers</h2>
<p>A single teacher in Fresno with ${K.usd(60000)} of taxable income sits in the ${rp(low.s)} bracket and the ${K.pct(low.f, 0)} federal one. Her CD would need ${K.pct(low.eq, 3)} to equal the T-bill. A single physician in San Diego at ${K.usd(520000)} pays ${rp(high.s)} to the state and ${K.pct(high.f, 0)} to Washington; his break-even CD rate is ${K.pct(high.eq, 3)}. The gap between the two equivalents is the whole story: the higher the bracket, the more a taxable yield must offer before it beats a Treasury.</p>
${h.mini('teq', { t: 'Break-even CD rate at a higher California income', p: ['inc'], d: { sx: SL, inc: 520000 } })}

<h2>Where it shows on the return</h2>
<p>Your federal return includes all the interest. California starts from federal income, so the Treasury interest has to come back out: it is subtracted on Schedule CA (540), the form where California adjusts federal amounts. Savings bond interest reported in the year you cash a bond gets the same treatment. California has no city or county income tax that reaches interest; the business taxes of San Francisco and other cities fall on payroll and receipts. For yields beyond the 26-week bill, see ${h.a('t-bill-rates', 'all current T-bill rates')}, and for a fuller look at the trade-off, ${h.a('t-bill-vs-cd', 'T-bills against CDs')}.</p>`,
  faqs: [
    { q: 'Does California tax Treasury bill interest?', a: `No. Federal law bars every state from taxing interest on U.S. Treasury obligations, and California follows it by subtracting that interest on Schedule CA (540). The interest stays taxable on your federal return. A bank CD, a money market account or a corporate bond pays interest that California taxes at rates up to ${rp(top[1])}.` },
    { q: 'Why does this California page use the 2025 tax brackets?', a: `The Franchise Tax Board had not released the indexed 2026 schedule when we built the page, so the ${S.year} schedule is the latest official one. Indexing moves the thresholds up each year by inflation and leaves the rates alone, so the marginal rate for most incomes is the same. We will switch to 2026 when the board publishes it.` },
    { q: 'Is the California Mental Health Services Tax included in the rates?', a: `Yes. That tax adds ${rp(mhs)} on taxable income above ${K.usd(mhsAt)} for every filing status. In our single schedule it is the ${rp(top[1])} row; in the joint schedule it turns the ${rp(jBelow[1])} rate into ${rp(jAt[1])} from ${K.usd(mhsAt)}. Interest on T-bills and savings bonds escapes it like the rest of the state income tax.` },
    { q: 'Do Californians pay state tax when they cash savings bonds?', a: `No. Interest on Series EE and Series I savings bonds is exempt from California income tax, just like T-bill interest, in the year you report it federally. If you cash bonds that earned ${K.usd(5000)} of interest while in the ${rp(r93)} bracket, a taxable account would have cost ${K.usd(5000 * r93)} more in state tax.` },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:oregon', 'state:hawaii'],
  toolArg: { inc: INC },
});
