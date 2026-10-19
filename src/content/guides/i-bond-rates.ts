import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const W = K.R.i.windows;
const cur = W[W.length - 1], prev = W[W.length - 2];
const now = K.composite(cur.fixed, cur.inflation);
const before = K.composite(prev.fixed, prev.inflation);
const nx = K.next();
// Worked case: I bond bought in March 2022 (fixed rate 0 %), rate this month.
const mar22 = K.irate('2022-03', K.BUILD);
const nov23 = K.irate('2023-11', K.BUILD);
const peak = W.reduce((a, w) => (K.composite(w.fixed, w.inflation) > K.composite(a.fixed, a.inflation) ? w : a));
const ann = (from: string) => `${from.endsWith('-05') ? 'May' : 'November'} ${from.slice(0, 4)}`;
const sixMonths = (from: string) => `${K.month(from).split(' ')[0]} ${from.slice(0, 4)} to ${from.endsWith('-05') ? 'October' : 'April'} ${from.endsWith('-05') ? from.slice(0, 4) : Number(from.slice(0, 4)) + 1}`;
const FT = K.R.i.fixedTable as Array<[string, number]>;
const endOf = (k: number) => (k + 1 < FT.length ? FT[k + 1][0] : K.NEXT);
const prevMonth = (m: string) => { const [y, mo] = m.split('-').map(Number); return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`; };
// Latest run of zero fixed rates, and the windows with a fixed rate of 3 % or more.
let z1 = -1, z0 = -1;
for (let k = FT.length - 1; k >= 0; k--) { if (FT[k][1] === 0) { if (z1 < 0) z1 = k; z0 = k; } else if (z1 >= 0) break; }
const high = FT.map((x, k) => ({ x, k })).filter(({ x }) => x[1] >= 0.03);
const highFrom = high[0].x[0], highTo = prevMonth(endOf(high[high.length - 1].k));
const zeroFrom = FT[z0][0], zeroTo = prevMonth(endOf(z1));
const neg = W.filter((w) => w.inflation < 0);
const rows = W.slice(-12).reverse().map((w) => [sixMonths(w.from), K.pct(w.fixed), K.pct(w.inflation), `<strong>${K.pct(K.composite(w.fixed, w.inflation))}</strong>`]);

export default defineGuide({
  id: 'i-bond-rates',
  group: 'ibond',
  order: 10,
  slug: 'i-bond-rates',
  nav: 'I bond rates',
  card: 'The rate of new I bonds and the rate your own bond earns now',
  title: 'I Bond Rates 2026: Current Rate and Your Bond’s Rate, US',
  description: `I bond rates in 2026: new bonds earn ${K.pct(now)} through October (fixed ${K.pct(cur.fixed)}). Find the rate your own I bond earns this month from its issue month and year.`,
  h1: 'I bond rates: the rate for new bonds and the one your bond earns',
  intro: `I bonds bought from May 1 to October 31, 2026 earn ${K.pct(now)}: a fixed rate of ${K.pct(cur.fixed)} plus inflation of ${K.pct(cur.inflation)} for six months. A bond you already own earns its own fixed rate plus the same inflation part.`,
  resume: `The composite rate of an I bond has two parts. The fixed rate is set on the day you buy and never changes for 30 years; for bonds issued from May through October 2026 it is ${K.pct(cur.fixed)}. The inflation rate is reset every May 1 and November 1 from the consumer price index (CPI-U); the one announced in ${ann(cur.from)} is ${K.pct(cur.inflation)} for six months. The Treasury combines them as fixed + 2 × inflation + fixed × inflation, rounded to 0.01 %, which gives ${K.pct(now)} for new bonds, after ${K.pct(before)} for bonds bought from November 2025 to April 2026. Your own bond moves to a new inflation rate on its six-month anniversaries, not on May 1. A bond from March 2022, with a fixed rate of ${K.pct(mar22.fixed!)}, earns ${mar22.rate === undefined ? 'n/a' : K.pct(mar22.rate)} in ${K.month(K.BUILD)}; one from November 2023, fixed at ${K.pct(nov23.fixed!)}, earns ${nov23.rate === undefined ? 'n/a' : K.pct(nov23.rate)}. The next announcement is on ${K.day(K.P.nextIBond.date)}${nx.official ? '' : `; its inflation part, already fixed by the CPI, is ${K.pct(nx.value)}`}.`,
  faqs: [
    { q: 'What is the I bond rate right now?', a: `New I bonds issued from May 1 to October 31, 2026 earn a composite ${K.pct(now)} for their first six months. That figure combines a fixed rate of ${K.pct(cur.fixed)}, kept for the life of the bond, and a semiannual inflation rate of ${K.pct(cur.inflation)}. A bond bought earlier earns its own fixed rate plus that same inflation part, so its rate can be lower or higher.` },
    { q: 'Why is my I bond earning less than the advertised rate?', a: `The advertised rate is for new bonds and includes the fixed rate of ${K.pct(cur.fixed)}. Bonds bought from ${K.month(zeroFrom)} to ${K.month(zeroTo)} have a fixed rate of zero, so they earn only twice the inflation rate. Your bond also switches to a new inflation rate on its own six-month anniversary, which can be up to five months after the May or November announcement.` },
    { q: 'Do I bond rates change on May 1 and November 1 for everyone?', a: 'The announcement dates are May 1 and November 1, but each bond adopts the new inflation rate at the start of its next six-month period, counted from its issue month. A bond issued in February changes in February and August; one issued in November changes in November and May. The fixed part never changes after purchase.' },
    { q: 'Can the I bond rate fall to zero?', a: `Yes. If prices fall, the semiannual inflation rate is negative, and it can cancel the fixed rate. The regulation stops the composite at zero, so a bond never loses value: in the worst case it earns nothing for six months. ${neg.length ? `It happened after the inflation rate announced in ${ann(neg[0].from)} came out at ${K.pct(neg[0].inflation)}.` : ''}` },
  ],
  body: (h) => `
<h2>The last six announcements, side by side</h2>
<p>Each row below is a six-month window. A bond bought inside the window gets its fixed rate for life and the composite rate in the last column for its first six months. After that it keeps the fixed rate and takes the inflation rate of the following announcements. The Treasury publishes the same figures in its rate history workbook (${h.src('td_ibond_history', 'TreasuryDirect')}); we read it when the site is built.</p>
${h.table(['Bought in', 'Fixed rate', 'Inflation, 6 months', 'Composite'], rows, 'I bond rates for new bonds, by six-month window. Composite = fixed + 2 × inflation + fixed × inflation (31 CFR 359).', ['l', 'r', 'r', 'r'])}
<p>The highest composite rate ever paid on new I bonds was ${K.pct(K.composite(peak.fixed, peak.inflation))}, for bonds bought from ${sixMonths(peak.from)}. Articles from 2022 and 2024 still rank for this question with those old figures; the rate in force is the one in the first row.</p>

<h2>How the Treasury computes the composite rate</h2>
<p>The formula is in 31 CFR 359, the regulation that governs Series I (${h.src('cfr_359', 'eCFR')}). The semiannual inflation rate is the change in the CPI-U, all items, not seasonally adjusted, between September and March (for the May announcement) or between March and September (for November). The CPI-U of March 2026 was ${K.dec(cur.cpi, 3)}; six months earlier it was ${K.dec(prev.cpi, 3)}. The change is ${K.pct(cur.inflation)}.</p>
<p>The composite then adds the fixed rate, doubles the inflation part to make it annual and adds a small cross term: ${K.pct(cur.fixed)} + 2 × ${K.pct(cur.inflation)} + ${K.pct(cur.fixed)} × ${K.pct(cur.inflation)} = ${K.pct(now)} after rounding. The cross term is tiny when both parts are small, but it is the reason a computed rate sometimes differs by 0.01 % from a quick mental sum.</p>
${h.mini('rate', { t: 'Rate of an I bond in any month', p: ['im', 'iy'], d: { iy: 2021 } })}

<h2>Your bond's rate, month by month</h2>
<p>Interest is added on the first day of each month, and the rate changes only every six months from the issue month. A bond bought in January 2022 had its periods start in January and July; it took the November 2025 inflation rate in January 2026 and the May 2026 one in July 2026. That is why two people holding I bonds can see different rates on the same day even with the same fixed rate. The calculator above lists every period of your bond so far, so you can see what it earned in each half-year and what it earns now.</p>
<p>For values in dollars rather than rates, the ${h.a('savings-bond-value', 'savings bond value table')} and the home page calculator apply these rates to the Treasury's valuation rules, with the three-month penalty for bonds under five years old.</p>

<h2>The fixed rate decides the long run</h2>
<p>Over 30 years the inflation part only keeps pace with prices; the fixed rate is the return above inflation. Bonds bought from ${K.month(highFrom)} to ${K.month(highTo)} carry fixed rates of 3 % or more, and they earn more than any new bond today as long as they are under 30 years old. Bonds bought from ${K.month(zeroFrom)} to ${K.month(zeroTo)} have a fixed rate of zero: they track inflation and nothing more. ${h.a('i-bond-fixed-rate-history', 'The full history of fixed rates')} shows which window your bond belongs to, and ${h.a('cash-i-bonds-early', 'the cash or keep calculator')} compares the penalty with what a new bond would pay.</p>

<h2>Buying in October or in November</h2>
<p>The issue month of a savings bond is the month the Treasury receives your payment, and interest counts from the first day of that month. A bond bought on October 30 is dated October 1: it keeps the fixed rate of the May to October window for 30 years and earns the current composite until April 1, then the inflation part announced in November. A bond bought on November 2 gets the new fixed rate and the new inflation part at once. When the inflation part is already known, as it is a few weeks before each announcement, the choice comes down to whether you expect the new fixed rate to be higher or lower than ${K.pct(cur.fixed)}.</p>

<h2>November 1, 2026</h2>
<p>${nx.official ? `The Treasury announced the rates for November 2026 to April 2027: inflation ${K.pct(nx.value)} and a fixed rate of ${K.pct(K.P.nextIBond.fixed ?? 0)}.` : `The inflation part of the next rate is already set by arithmetic. The CPI-U of September 2026, published by the Bureau of Labor Statistics, is ${K.dec(K.P.nextIBond.cpiSeptember, 3)}; against ${K.dec(K.P.nextIBond.cpiMarch, 3)} in March, that is ${K.pct(nx.value)} for six months. Only the fixed rate for new bonds is unknown until the announcement.`} ${h.a('next-i-bond-rate', 'The next rate page')} shows what each fixed rate would give and when your own bond moves to the new inflation part.</p>`,
  tool: 'rate',
  toolArg: { iy: 2022, im: 3 },
  related: ['next-i-bond-rate', 'i-bond-fixed-rate-history', 'i-bonds', 'cash-i-bonds-early'],
  sources: ['td_ibond_rates', 'td_ibond_history', 'cfr_359', 'bls_cpi'],
});
