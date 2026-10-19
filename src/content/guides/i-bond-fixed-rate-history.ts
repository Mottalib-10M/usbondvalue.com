import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const FT = K.R.i.fixedTable as Array<[string, number]>;
const prevMonth = (m: string) => { const [y, mo] = m.split('-').map(Number); return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`; };
const endOf = (k: number) => prevMonth(k + 1 < FT.length ? FT[k + 1][0] : K.NEXT);
const label = (k: number) => { const a = FT[k][0], b = endOf(k); return a === b ? K.month(a) : `${K.month(a)} to ${K.month(b)}`; };
// Rate each window earns this month (issue months of a window can differ when the build month is November to April).
const nowRates = (k: number) => {
  const set = new Set<string>();
  const [y0, m0] = FT[k][0].split('-').map(Number), [y1, m1] = endOf(k).split('-').map(Number);
  for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); m === 12 ? (y++, m = 1) : m++) {
    const r = K.irate(`${y}-${String(m).padStart(2, '0')}`, K.BUILD).rate;
    if (r !== undefined) set.add(K.pct(r));
  }
  return [...set].join(' or ') || 'matured';
};
const rows = FT.map((x, k) => [label(k), K.pct(x[1]), nowRates(k)]).reverse();
const max = FT.reduce((a, x) => (x[1] > a[1] ? x : a));
const zeroWindows = FT.filter((x) => x[1] === 0).length;
const positive = FT.filter((x) => x[1] > 0).length;
const cur = FT[FT.length - 1];
// Runs of zero fixed rates.
const runs: Array<[number, number]> = [];
FT.forEach((x, k) => { if (x[1] === 0) { const r = runs[runs.length - 1]; if (r && r[1] === k - 1) r[1] = k; else runs.push([k, k]); } });
const runText = runs.map(([a, b]) => `${K.month(FT[a][0])} to ${K.month(endOf(b))}`).join(', ');
// Worked cases: a 2000 bond with the top fixed rate, and a 2021 bond with none.
const top = K.irate(max[0], K.BUILD);
const z = K.irate('2021-02', K.BUILD);
const v2000 = K.bond('I', max[0], K.BUILD, 'paper', 1000);
// Two bonds bought ten years apart in the same calendar month, one with a positive fixed rate, one at zero.
const a2007 = K.bond('I', '2007-05', K.BUILD, 'paper', 1000), a2011 = K.bond('I', '2011-05', K.BUILD, 'paper', 1000);
const p2007 = K.periods('I', '2007-05', K.BUILD), p2011 = K.periods('I', '2011-05', K.BUILD);

export default defineGuide({
  id: 'i-bond-fixed-rate-history',
  group: 'ibond',
  order: 40,
  slug: 'i-bond-fixed-rate-history',
  nav: 'I bond fixed rate history',
  card: 'Every fixed rate since 1998 and what those bonds earn today',
  title: 'I Bond Fixed Rate History 2026: Every Rate Since 1998, US',
  description: `I bond fixed rate history to 2026: every fixed rate since September 1998, from ${K.pct(0)} to ${K.pct(max[1])}, and the composite rate each group of bonds earns this month.`,
  h1: 'I bond fixed rates since 1998, and what each group earns now',
  intro: `The fixed rate an I bond gets in its issue month never changes. This table lists all ${FT.length} windows since September 1998 and the rate each group earns in ${K.month(K.BUILD)}.`,
  resume: `Every I bond has a fixed rate, set for its six-month sales window and kept for 30 years, plus an inflation rate that changes every six months. The fixed rate is the part that separates one bond from another over the long run. Since the first I bonds of September 1998, the Treasury has set ${FT.length} fixed rates. The highest, ${K.pct(max[1])}, went to bonds bought from ${label(FT.indexOf(max))}; those bonds earn ${top.rate === undefined ? 'n/a' : K.pct(top.rate)} in ${K.month(K.BUILD)} and a ${K.usd(1000)} paper bond from that window is worth ${v2000.ok ? K.usd2(v2000.value!) : 'n/a'}. In ${zeroWindows} of the windows the fixed rate was zero, so those bonds earn only the inflation part: ${z.rate === undefined ? 'n/a' : K.pct(z.rate)} this month for a bond of February 2021. The current window, ${label(FT.length - 1)}, carries ${K.pct(cur[1])}. Find your issue month in the table, read its fixed rate, and the last column gives the composite rate your bond earns now.`,
  faqs: [
    { q: 'Which I bonds have the highest fixed rate?', a: `Bonds issued from ${label(FT.indexOf(max))} have the highest fixed rate ever set, ${K.pct(max[1])}. As long as they are under 30 years old, they earn that fixed rate plus the current inflation part, more than any bond sold since.` },
    { q: 'Does the fixed rate of my I bond ever change?', a: 'No. The fixed rate of the issue month applies for the whole 30 years, whatever the Treasury announces later. Only the inflation part changes, every six months from the issue month. A bond bought with a zero fixed rate keeps a zero fixed rate until it matures.' },
    { q: 'Why did so many I bonds get a 0 % fixed rate?', a: `The Treasury sets the fixed rate at each announcement without publishing a formula, so the reason for a given rate is not stated. The record shows ${zeroWindows} windows at zero against ${positive} with a positive rate, in stretches from ${runText}. Bonds from those windows earn only the inflation part for their whole life.` },
  ],
  body: (h) => `
<h2>The full table</h2>
<p>Each row is one sales window. The fixed rate is the one printed in the Treasury's rate history workbook (${h.src('td_ibond_history', 'TreasuryDirect')}); the last column applies this month's inflation part to it with the Treasury's formula. When a window shows two rates, bonds issued in different months of that window have not yet reached the same rate period.</p>
${h.table(['Issue months', 'Fixed rate', `Composite in ${K.month(K.BUILD)}`], rows, 'Series I fixed rates by issue window, newest first. Composite = fixed + 2 × inflation + fixed × inflation (31 CFR 359). Bonds over 30 years old no longer earn interest.', ['l', 'r', 'r'])}

<h2>What the numbers show</h2>
<p>The first I bonds, in 1998, came with a fixed rate of ${K.pct(FT[0][1])}. The rate climbed to ${K.pct(max[1])} for ${label(FT.indexOf(max))}, then fell over the following decade. Stretches of zero fixed rates ran from ${runText}. Since ${K.month(FT[runs[runs.length - 1][1] + 1]?.[0] ?? cur[0])} the fixed rate has been positive in every window, ${K.pct(cur[1])} in the current one.</p>
<p>A fixed rate is a real return: it is what the bond earns above inflation as measured by the CPI-U. A bond at ${K.pct(max[1])} doubles its purchasing power in roughly ${Math.round(Math.log(2) / Math.log(1 + max[1]))} years on top of keeping up with prices. A bond at zero only keeps up. Over the 30 years of a bond, that difference outweighs any single six-month inflation figure.</p>
${h.mini('rate', { t: 'Fixed and composite rate of your bond', p: ['im', 'iy'], d: { iy: 2007, im: 11 } })}

<h2>Reading your bond's window</h2>
<p>The issue month is printed on a paper bond, top right, and shown in the bond details of a TreasuryDirect account. Windows run from May to October and from November to April, except the first one, which started in September 1998. A bond issued in October 2022 belongs to the May to October 2022 window, with a fixed rate of ${K.pct(K.iFixed('2022-10'))}; one issued a month later, in November 2022, got ${K.pct(K.iFixed('2022-11'))}. That one-month gap is the main reason two I bonds bought the same autumn can earn different rates for 30 years.</p>
<p>The calculator above shows every rate period of a bond with its composite rate. For the dollar value, use the ${h.a('savings-bond-value', 'value table')} or the home page calculator; for the rates of the current window and the November announcement, see ${h.a('i-bond-rates', 'I bond rates')} and ${h.a('next-i-bond-rate', 'the next rate')}.</p>

<h2>Same inflation, different fixed rates</h2>
<p>Two paper bonds of ${K.usd(1000)} make the point in dollars. One was bought in May 2007 with a fixed rate of ${K.pct(K.iFixed('2007-05'))}; the other in May 2011 with ${K.pct(K.iFixed('2011-05'))}. Since May 2011 both have received exactly the same inflation part at every reset, because they share the May and November schedule. The 2007 bond is worth ${a2007.ok ? K.usd2(a2007.value!) : 'n/a'} on the first of ${K.month(K.BUILD)}, the 2011 bond ${a2011.ok ? K.usd2(a2011.value!) : 'n/a'}. Part of the gap is the four extra years of the older bond; the rest is the fixed rate, applied at each of the ${p2011.length} rate periods the two bonds have shared. Measured against its price, the 2007 bond has multiplied its value by ${a2007.ok ? K.dec(a2007.value! / 1000, 2) : 'n/a'} and the 2011 bond by ${a2011.ok ? K.dec(a2011.value! / 1000, 2) : 'n/a'}.</p>
<p>The same arithmetic applies in the other direction to anyone choosing between buying in the last days of a window and the first days of the next one. Once the inflation part of the next announcement is known, as it is a few weeks ahead from the CPI-U, the only open question is whether the next fixed rate will be higher or lower than the current ${K.pct(cur[1])}. The Treasury answers it on the announcement day and not before.</p>

<h2>Bonds near the end of their 30 years</h2>
<p>I bonds from the first windows of 1998 and 1999 reach final maturity 30 years after issue, from ${K.month(`${Number(FT[0][0].slice(0, 4)) + 30}${FT[0][0].slice(4)}`)} on. They earn their fixed rate plus inflation until that month, then nothing. An electronic bond is paid out automatically at final maturity; a paper one has to be cashed, and its interest is taxable in the year it matures. The ${h.a('matured-savings-bonds', 'matured bonds page')} explains what to do with a bond that has stopped earning, and ${h.a('cash-i-bonds-early', 'the early cashing page')} covers the other end of a bond's life.</p>`,
  tool: 'rate',
  toolArg: { sr: 'I', iy: 2001, im: 1 },
  related: ['i-bond-rates', 'next-i-bond-rate', 'i-bonds', 'savings-bond-value'],
  sources: ['td_ibond_history', 'td_ibond_rates', 'cfr_359'],
});
