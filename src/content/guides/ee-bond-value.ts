import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ymN = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const on1 = (s: string) => K.month(s).replace(' ', ' 1, ');
const NOW = K.BUILD, nowN = ymN(NOW);
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');
const P100 = (issue: string, at = NOW) => K.bond('EE', issue, at, 'paper', 100);

// One worked bond per period of EE rules, each a $100 paper bond (bought for $50).
const a = P100('1990-03'), aFloor = P100('1994-11');
const b = P100('1996-02');
const c = P100('1999-06');
const d = P100('2008-09'), dRate = K.periods('EE', '2008-09', '2008-09')[0][1];
const dAtOm = d.om !== undefined ? P100('2008-09', ymS(d.om)) : d;
// Period B: interest is credited every six months, so the value steps twice a year.
const bSteps = ['2025-01', '2025-02', '2025-07', '2025-08'].map((m) => [m, P100('1996-02', m)] as const);
// Period B bonds still earning: issued after the 30-year cutoff and before May 1997.
const cutoffN = nowN - K.P.bonds.finalMaturityMonths;
const bStillFrom = ymS(Math.max(ymN('1995-05'), cutoffN + 1));
const bStillAny = ymN(bStillFrom) <= ymN('1997-04');
const bLate = bStillAny ? P100(bStillFrom) : undefined;
// Period C: the rate in force for its latest window, and its range since May 1997.
const E97 = K.R.ee1997 as Array<[string, number]>;
const e97last = E97[E97.length - 1];
const e97hi = Math.max(...E97.map((x) => x[1])), e97lo = Math.min(...E97.map((x) => x[1]));
const yrs = (m: number) => m / 12;
const pct0 = (x: number) => K.pct(x, 0);

const rows = [
  ['Before May 1995', 'March 1990', K.usd2(a.price ?? 0), v(a), 'stopped earning; final value'],
  ['May 1995 to April 1997', 'February 1996', K.usd2(b.price ?? 0), v(b), b.stopped ? `stopped in ${K.month(ymS(b.finalMonth))}` : `earns ${K.pct(b.rate ?? 0)}`],
  ['May 1997 to April 2005', 'June 1999', K.usd2(c.price ?? 0), v(c), c.stopped ? 'stopped' : `earns ${K.pct(c.rate ?? 0)} until ${K.month(ymS(c.finalMonth))}`],
  ['May 2005 and later', 'September 2008', K.usd2(d.price ?? 0), v(d), `fixed ${K.pct(dRate)}; ${d.om !== undefined && d.om > nowN ? `${v(dAtOm)} in ${K.month(ymS(d.om))}` : 'doubled'}`],
];

export default defineGuide({
  id: 'ee-bond-value',
  group: 'value',
  order: 20,
  slug: 'ee-bond-value',
  nav: 'EE bond value',
  card: 'The four sets of EE rules and what each bond is worth now',
  title: 'EE Bond Value 2026: Worth of Each Issue Period, US',
  description: `EE bond value in 2026 under each of the four sets of Treasury rules: a $100 paper EE bond of June 1999, bought for $50, is worth ${v(c)} on ${on1(NOW)}.`,
  h1: 'EE bond value: four sets of rules, four kinds of bond',
  intro: `A Series EE bond is valued by the rules in force the month it was issued, and the Treasury changed those rules in May 1995, May 1997 and May 2005.`,
  resume: `A ${K.usd(100)} paper EE bond cost ${K.usd(50)}, and its value on ${on1(NOW)} depends first on its issue date. Bonds issued before May 1995 have all passed 30 years and hold a final value: ${v(a)} for one from March 1990. Bonds of May 1995 to April 1997 earned a short-term rate for five years and a long-term rate afterwards, with interest credited only every six months; one from February 1996 ended at ${v(b)}. Bonds of May 1997 to April 2005 earn a rate the Treasury resets every May and November, ${K.pct(e97last[1])} for the window that began in ${K.month(e97last[0])}, and a June 1999 bond is worth ${v(c)}. Bonds from May 2005 on keep the rate of their purchase month: a September 2008 bond earns ${K.pct(dRate)} and is worth ${v(d)}, under its face value until the Treasury doubles it in ${d.om !== undefined ? K.month(ymS(d.om)) : 'its 20th year'}. Face value says what a bond reaches at a set date, not what it is worth now.`,
  faqs: [
    { q: 'Is my paper EE bond worth the amount printed on it?', a: `Only at certain points in its life. The printed face value is twice the ${K.usd(50)} price of a ${K.usd(100)} bond. Bonds from May 1995 to May 2003 reach it at ${yrs(204)} years, those from June 2003 at ${yrs(K.P.bonds.eeDoublingMonths)} years. Before that the bond can be worth less than face, like the ${v(d)} of a September 2008 bond; after it, more, like the ${v(c)} of a June 1999 bond.` },
    { q: 'Why does a 1996 EE bond change value only twice a year?', a: `EE bonds issued from May 1995 to April 1997 have their interest credited every six months rather than every month. Between two credit dates the value stays flat: a February 1996 bond showed ${v(bSteps[0][1])} in January 2025 and ${v(bSteps[1][1])} in February, then ${v(bSteps[2][1])} in July and ${v(bSteps[3][1])} in August. Cashing a month before a credit date gives up the whole half-year of interest.` },
    { q: 'What rate does an EE bond from 1997 to 2005 earn now?', a: `These bonds carry a variable rate that the Treasury announces for each six-month window. For the window that began in ${K.month(e97last[0])} it is ${K.pct(e97last[1])}, and each bond adopts it at the start of its own next six-month period. Since 1997 the rate of this group has ranged from ${K.pct(e97lo)} to ${K.pct(e97hi)}. Interest stops 30 years after issue, so the first of them stop in May 2027.` },
    { q: 'What is the minimum value of an EE bond from 1993 or 1994?', a: `EE bonds issued from March 1993 to April 1995 had a floor: at least ${pct0(0.04)} a year, compounded every six months, over their 30 years. The last Treasury redemption table, of May 2023, was printed before the youngest of them reached 30 years, so the calculator shows the floor value as a minimum: ${v(aFloor)} for a ${K.usd(100)} bond of November 1994. What the Treasury pays is at least that figure.` },
  ],
  body: (h) => `
<h2>The four EE periods at a glance</h2>
<p>EE bonds have been sold since January 1980, on paper until 2012 and electronically since 2003. Over those years the Treasury rewrote how they earn interest three times, and each rewrite applied to bonds bought from that month on. Two bonds that look identical in a drawer can therefore follow entirely different arithmetic. The table takes one ${K.usd(100)} paper bond from each period and values it on ${on1(NOW)}.</p>
${h.table(['Issued', 'Example', 'Price', 'Value', 'Where it stands'], rows, `$100 paper EE bonds, value on ${on1(NOW)}. Sources: TreasuryDirect EE rate pages, Treasury redemption table of May 2023 for bonds that no longer earn.`, ['l', 'l', 'r', 'r', 'l'])}

<h2>Before May 1995: final values from the last table</h2>
<p>Every EE bond issued from January 1980 through April 1995 has now passed its 30-year final maturity, so none of them earns anything more. The rules behind their growth changed more than once during those fifteen years, but for an owner today only the outcome counts, and the outcome is a fixed number. A March 1990 bond is worth ${v(a)} and will be worth exactly that next year. The Treasury published those figures in its redemption tables until May 2023 (${h.src('fd_redemption', 'Fiscal Data')}), and the calculator reads them directly.</p>
<p>The bonds of the last stretch, March 1993 to April 1995, are a special case. They carry a minimum return of ${pct0(0.04)} a year compounded semiannually over 30 years, and the youngest ones reached 30 years after the last table came out. For those, the calculator shows the value the floor produces, ${v(aFloor)} for a November 1994 bond, and labels it as a minimum (${h.src('td_ee1980', 'TreasuryDirect')}).</p>

<h2>May 1995 to April 1997: two rates and a six-month clock</h2>
<p>These bonds earned a short-term rate for their first five years and a long-term rate after that, each set by the Treasury. The feature that surprises owners is the timing: interest was credited every six months, not every month. A February 1996 bond showed ${v(bSteps[0][1])} in January 2025 and ${v(bSteps[1][1])} one month later, then held ${v(bSteps[2][1])} through July before stepping to ${v(bSteps[3][1])} in August. Cashing in July meant losing the half-year that was about to be credited.</p>
<p>${bStillAny ? `Most of this group has now stopped earning. The ones still inside their 30 years were issued from ${K.month(bStillFrom)} to April 1997, and a ${K.usd(100)} bond from ${K.month(bStillFrom)} is worth ${bLate ? v(bLate) : 'n/a'} at a long-term rate of ${K.pct(bLate?.rate ?? 0)}.` : 'Every bond of this group has now passed 30 years and stopped earning.'} They reached face value at ${yrs(204)} years, a step the Treasury took on itself if the rates had not done it (${h.src('td_ee1995', 'TreasuryDirect')}).</p>
${h.mini('bond', { t: 'Value of a 1995 to 1997 EE bond in any month', p: ['im', 'iy'], d: { sr: 'EE', fm: 'paper', im: 2, iy: 1996, amt: 200 } })}

<h2>May 1997 to April 2005: a rate that still moves</h2>
<p>From May 1997 the Treasury switched EE bonds to a rate reset every six months and credited monthly, with interest compounding every half-year. The rate for the window that started in ${K.month(e97last[0])} is ${K.pct(e97last[1])}; over the life of the group it has been as high as ${K.pct(e97hi)} and as low as ${K.pct(e97lo)} (${h.src('td_ee1997', 'TreasuryDirect')}). A bond takes each new rate at its own next six-month anniversary, so a June bond changes in June and December.</p>
<p>The June 1999 bond in the table is worth ${v(c)}, well past its face value, which it reached at ${yrs(204)} years. Bonds bought from June 2003 to April 2005 instead carry the 20-year doubling of the next group while keeping the variable rate. Interest on the whole group stops between May 2027 and April 2035, ${yrs(K.P.bonds.finalMaturityMonths)} years after each issue month.</p>
${h.mini('rate', { t: 'Rate of an EE bond from 1997 to 2005', p: ['iy', 'im'], d: { sr: 'EE', iy: 2001, im: 11 } })}

<h2>May 2005 and later: one rate for 20 years</h2>
<p>An EE bond bought since May 2005 keeps the rate announced for its purchase window. For many of those windows the rate was a fraction of a percent, which is why so many bonds from the 2010s sit just above their price. The September 2008 bond earns ${K.pct(dRate)} and is worth ${v(d)}; on its 20th anniversary, ${d.om !== undefined ? on1(ymS(d.om)) : 'at 20 years'}, the Treasury will raise it to ${v(dAtOm)}, twice its price, because the rate alone would not get there. ${h.a('ee-bond-doubling', 'The doubling page')} shows the size of that step for each window and what the current rate gives without it.</p>

<h2>Face value against real value</h2>
<p>The number printed on a paper EE bond is a target, not a balance. A ${K.usd(100)} bond was bought for ${K.usd(50)}, and its real value is that price plus the interest credited so far, minus three months of interest if it is under five years old. Early in its life it is worth less than face; later it can be worth much more. The bonds in the first and third rows are worth more than their face value; the 2008 bond is still short of it.</p>
<p>Electronic EE bonds have no face value at all. They are bought at their full price, from ${K.usd(K.P.bonds.electronicMin)} to the penny, and the doubling applies to that price. For the rules on buying new ones, see ${h.a('ee-bonds', 'EE bonds today')}; for a table of January values year by year, ${h.a('savings-bond-value', 'the savings bond value table')}; for older bonds of the Series E, ${h.a('series-e-bond-value', 'the E bond page')}; and to compare with the other series, ${h.a('i-bonds-vs-ee-bonds', 'I bonds against EE bonds')}.</p>`,
  tool: 'bond',
  toolArg: { sr: 'EE', fm: 'paper', iy: 1999, im: 6, amt: 100 },
  related: ['ee-bonds', 'ee-bond-doubling', 'savings-bond-value', 'matured-savings-bonds', 'i-bonds-vs-ee-bonds'],
  sources: ['td_eebonds', 'td_ee2005', 'td_ee1997', 'td_ee1995', 'td_ee1980', 'fd_redemption'],
});
