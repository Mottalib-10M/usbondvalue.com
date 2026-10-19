import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const N = K.P.nextIBond;
const nx = K.next();
const W = K.R.i.windows;
const cur = W[W.length - 1];
const curRate = K.composite(cur.fixed, cur.inflation);
const official = N.fixed !== null && N.inflation !== null;
const fixedNow = official ? (N.fixed as number) : cur.fixed;
const newRate = K.composite(fixedNow, nx.value);
const ann = K.day(N.date);
// Hypothetical fixed rates for new bonds (labelled as such), around the current one.
const hyp = [...new Set([0, 0.005, cur.fixed, 0.01, 0.013])].sort((a, b) => a - b);
const hypRows = hyp.map((f) => [K.pct(f), K.pct(K.composite(f, nx.value)), f === cur.fixed ? 'same fixed rate as May to October 2026' : '']);
// When an existing bond moves to the new inflation part: the first of its six-month anniversaries from November.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const nextYear = Number(N.periodFrom.slice(0, 4)) + 1;
const switchRows = MONTHS.map((m, i) => {
  const mo = i + 1;
  // Periods start in the issue month and six months later: the first start in November to April.
  const starts = [mo, ((mo + 5) % 12) + 1];
  const first = starts.find((x) => x >= 11 || x <= 4)!;
  const year = first >= 11 ? Number(N.periodFrom.slice(0, 4)) : nextYear;
  return [m, `${MONTHS[first - 1]} 1, ${year}`, `${MONTHS[(first + 5) % 12]} 1, ${first + 6 > 12 ? year + 1 : year}`];
});
// Worked cases: one bond with a zero fixed rate, one with 1.30 %.
const zeroB = K.iFixed('2021-06'), highB = K.iFixed('2024-01');

export default defineGuide({
  id: 'next-i-bond-rate',
  group: 'ibond',
  order: 30,
  slug: 'next-i-bond-rate',
  nav: 'Next I bond rate',
  card: official ? `The rate from November 1, 2026: ${K.pct(newRate)}` : `November 1, 2026: inflation part already ${K.pct(nx.value)}`,
  title: 'Next I Bond Rate 2026: November 1 Rate From CPI Data, US',
  description: official
    ? `Next I bond rate: from November 1, 2026 new I bonds earn ${K.pct(newRate)}, fixed ${K.pct(fixedNow)}, inflation ${K.pct(nx.value)}. See when your own bond moves to it.`
    : `Next I bond rate, November 1, 2026: the inflation part is already ${K.pct(nx.value)} from the CPI-U. The fixed rate is announced that day. See what each one gives.`,
  h1: official ? 'The I bond rate from November 1, 2026' : 'The next I bond rate: what is already known before November 1',
  intro: official
    ? `The Treasury announced on ${ann} the rates for I bonds bought from November 2026 to April 2027: a fixed rate of ${K.pct(fixedNow)} and inflation of ${K.pct(nx.value)} for six months.`
    : `The Treasury announces the next I bond rate on ${ann}. Half of it is already set by the consumer price index: the inflation part will be ${K.pct(nx.value)} for six months.`,
  resume: official
    ? `I bonds bought from November 1, 2026 to April 30, 2027 earn a composite rate of ${K.pct(newRate)} for their first six months: a fixed rate of ${K.pct(fixedNow)}, kept for 30 years, plus a semiannual inflation rate of ${K.pct(nx.value)}, the change in the CPI-U between March (${K.dec(N.cpiMarch, 3)}) and September 2026 (${K.dec(N.cpiSeptember, 3)}). That compares with ${K.pct(curRate)} for bonds bought from May to October 2026. Bonds you already hold keep their own fixed rate and switch to the new inflation part at the start of their next six-month period, between November 2026 and April 2027 depending on the issue month: a bond with a zero fixed rate earns ${K.pct(K.composite(0, nx.value))}, one with ${K.pct(highB!)} earns ${K.pct(K.composite(highB!, nx.value))}. The table below gives the date for each issue month, and the calculator shows the rate for your bond.`
    : `The I bond rate for bonds bought from November 1, 2026 to April 30, 2027 is announced by the Treasury on ${ann}. One of its two parts is already fixed by arithmetic. The inflation part is the change in the CPI-U, all items, not seasonally adjusted, from March to September: ${K.dec(N.cpiMarch, 3)} to ${K.dec(N.cpiSeptember, 3)}, published by the Bureau of Labor Statistics on ${K.day(N.cpiSeptemberReleased)}, which gives ${K.pct(nx.value)} for six months. This is our calculation with the rule of 31 CFR 359, not a Treasury figure. The other part, the fixed rate for new bonds, is set by the Treasury and has no formula. If it stayed at ${K.pct(cur.fixed)}, new bonds would earn ${K.pct(newRate)}, against ${K.pct(curRate)} today. Bonds you already own do not depend on that fixed rate: a bond with a zero fixed rate will earn ${K.pct(K.composite(0, nx.value))} from its next six-month anniversary, one with ${K.pct(highB!)} will earn ${K.pct(K.composite(highB!, nx.value))}. This page is updated on ${ann} with the official rates.`,
  faqs: [
    { q: 'What will the I bond rate be on November 1, 2026?', a: official ? `The Treasury set it at ${K.pct(newRate)} for bonds bought from November 2026 through April 2027. The fixed part is ${K.pct(fixedNow)} for the life of those bonds; the inflation part, ${K.pct(nx.value)} for six months, comes from the rise in the CPI-U between March and September 2026.` : `The inflation part is already known from the CPI-U: ${K.pct(nx.value)} for six months. The fixed rate for new bonds is announced on ${ann} and has no published formula, so the composite cannot be known before then. With the current fixed rate of ${K.pct(cur.fixed)}, it would be ${K.pct(newRate)}.` },
    { q: 'How is the inflation part of the November I bond rate computed?', a: `Take the CPI-U for all urban consumers, all items, not seasonally adjusted, for September, subtract the March figure and divide by the March figure. The result, rounded to 0.01 %, is the semiannual inflation rate (31 CFR 359). For November 2026 that is ${K.dec(N.cpiSeptember, 3)} minus ${K.dec(N.cpiMarch, 3)}, divided by ${K.dec(N.cpiMarch, 3)}: ${K.pct(nx.value)}.` },
    { q: 'When does my existing I bond start earning the November rate?', a: 'On the first day of its next six-month period that begins between November and April. A bond issued in March changes in March 2027; one issued in December changes in December 2026. Its fixed rate never changes, so only the inflation part moves. The table on this page gives the date for every issue month, and the calculator gives the resulting rate.' },
    { q: 'Should I buy I bonds in October or wait until November?', a: `It depends on the fixed rate, which nobody knows before ${ann}. A bond bought in October keeps the fixed rate of ${K.pct(cur.fixed)} for 30 years and earns the current composite for six months, then the new inflation part. A bond bought in November gets the new fixed rate and the new inflation part at once. The page shows both paths without telling you which to pick.` },
  ],
  body: (h) => `
<h2>Two parts, one already known</h2>
<p>The composite rate of an I bond is the fixed rate plus twice the semiannual inflation rate plus the product of the two (${h.src('cfr_359', '31 CFR 359')}). The inflation rate comes straight from a price index. For the November announcement, the Treasury uses the CPI-U of March and of September of the same year, as published by the Bureau of Labor Statistics (${h.src('bls_cpi', 'BLS series CUUR0000SA0')}). The September figure came out on ${K.day(N.cpiSeptemberReleased)}, so the arithmetic can be done today: (${K.dec(N.cpiSeptember, 3)} − ${K.dec(N.cpiMarch, 3)}) ÷ ${K.dec(N.cpiMarch, 3)} = ${K.pct(nx.value)}${official ? ', the figure the Treasury announced' : ''}.</p>
<p>The fixed rate is different. The Treasury sets it each May and November without publishing a formula, and it has ranged from ${K.pct(Math.min(...K.R.i.fixedTable.map((x) => x[1] as number)))} to ${K.pct(Math.max(...K.R.i.fixedTable.map((x) => x[1] as number)))} since 1998. ${official ? `For bonds bought from November 2026 to April 2027 it is ${K.pct(fixedNow)}.` : 'No estimate of it is a Treasury figure, and this page does not offer one.'}</p>

<h2>${official ? 'The composite rate for new bonds' : 'What each fixed rate would give'}</h2>
${official ? `<p>With a fixed rate of ${K.pct(fixedNow)} and inflation of ${K.pct(nx.value)}, new bonds earn ${K.pct(newRate)} for their first six months. The table keeps the other fixed rates for comparison with bonds bought earlier.</p>` : `<p>The table pairs the known inflation part with a few fixed rates, including the one in force from May to October 2026. These rows are hypotheses to read the announcement quickly, not forecasts.</p>`}
${h.table(['Fixed rate', 'Composite with inflation of ' + K.pct(nx.value), ''], hypRows, `Composite = fixed + 2 × ${K.pct(nx.value)} + fixed × ${K.pct(nx.value)}, rounded to 0.01 %. ${official ? 'Announced rates.' : 'Inflation part computed from BLS data; fixed rates are examples.'}`, ['r', 'r', 'l'])}
${h.mini('inext', { t: 'Composite for a fixed rate you choose', p: ['fx'], d: { fx: 0.5 } })}

<h2>When the bonds you already own change</h2>
<p>An existing bond keeps the fixed rate of its issue month and takes the inflation part of the latest announcement on its own schedule: every six months from the issue month. So the November announcement reaches bonds one month at a time, from November 2026 to April 2027, and each keeps it for six months.</p>
${h.table(['Issue month (any year)', 'New inflation part from', 'Next change'], switchRows, 'First day of the bond’s six-month period that starts between November and April. Interest is added monthly; the rate shown in TreasuryDirect changes on that date.', ['l', 'l', 'l'])}
<p>For a bond with a fixed rate of zero, like those issued in June 2021 (fixed ${K.pct(zeroB!)}), the composite becomes twice the inflation part: ${K.pct(K.composite(zeroB!, nx.value))}. For one issued in January 2024 with ${K.pct(highB!)} fixed, it becomes ${K.pct(K.composite(highB!, nx.value))}. ${h.a('i-bond-rates', 'The I bond rates page')} gives the rate your bond earns today, before the switch.</p>

<h2>October or November</h2>
<p>A purchase is dated the first day of the month the Treasury receives the money. A bond bought at the end of October is an October bond: its fixed rate is ${K.pct(cur.fixed)}, it earns ${K.pct(curRate)} until the end of March and then the November inflation part for six months. A bond bought on November 2 carries the new fixed rate for 30 years and earns ${official ? K.pct(newRate) : 'the new composite'} at once. Over a long holding the fixed rate matters more than six months of inflation; over a short one the reverse is true. The ${h.a('cash-i-bonds-early', 'early cashing calculator')} shows what a short holding loses to the penalty.</p>

<h2>The inflation part in recent announcements</h2>
<p>The figure for November 2026 is easier to judge next to the previous ones. Over the last six announcements the semiannual inflation rate was ${W.slice(-6).map((w) => `${K.pct(w.inflation)} in ${w.from.endsWith('-05') ? 'May' : 'November'} ${w.from.slice(0, 4)}`).join(', ')}. Doubled, those are the annual inflation rates that bonds with a zero fixed rate earned in each half-year. A semiannual change of ${K.pct(nx.value)} is ${nx.value > cur.inflation ? 'higher' : nx.value < cur.inflation ? 'lower' : 'the same as'} the ${K.pct(cur.inflation)} of May 2026, so every bond's composite rate ${nx.value > cur.inflation ? 'rises' : nx.value < cur.inflation ? 'falls' : 'stays put'} when it reaches its switch date, by ${K.pct(Math.abs(K.composite(0, nx.value) - K.composite(0, cur.inflation)))} for a bond with no fixed rate.</p>
<p>Because the rate of a bond is applied for six months and compounded, the difference shows in dollars slowly. On a bond worth ${K.usd(10000)}, one extra percentage point of annual rate adds about ${K.usd(10000 * 0.01 / 2)} over a six-month period. The ${h.a('savings-bond-value', 'value table')} turns each rate into the amount the Treasury would pay.</p>

<h2>How this page is updated</h2>
<p>The site reads the Treasury's rate history when it is built. On ${ann}, the fixed rate and the inflation rate of the announcement are entered in the parameter file with the date they were read, the rate history is downloaded again, and every page that shows a current rate, from the ${h.a('i-bond-fixed-rate-history', 'fixed rate history')} to the value calculator, moves to the new figures the same day. Until then, the inflation figure above is labelled as our calculation from BLS data.</p>`,
  tool: 'inext',
  related: ['i-bond-rates', 'i-bond-fixed-rate-history', 'i-bonds', 'cash-i-bonds-early'],
  sources: ['td_ibond_rates', 'bls_cpi', 'cfr_359', 'td_ibond_history'],
});
