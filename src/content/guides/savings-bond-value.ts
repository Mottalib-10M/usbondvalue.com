import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

// Month arithmetic on the engine's month index (year × 12 + month − 1).
const ymN = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const on1 = (s: string) => K.month(s).replace(' ', ' 1, ');
const NOW = K.BUILD, nowN = ymN(NOW), nowY = Number(NOW.slice(0, 4));
// Paper EE bonds were sold through 2012, paper I bonds through 2024 (tax refunds); later rows use the electronic form at the same price.
const EE_PAPER_TO = 2012, I_PAPER_TO = 2024;
const eeOf = (y: number) => K.bond('EE', `${y}-01`, NOW, y <= EE_PAPER_TO ? 'paper' : 'electronic', y <= EE_PAPER_TO ? 100 : 50);
const iOf = (y: number) => K.bond('I', `${y}-01`, NOW, y <= I_PAPER_TO ? 'paper' : 'electronic', 100);
const YEARS = Array.from({ length: nowY - 1996 + 1 }, (_, k) => nowY - k);
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');
const note = (y: number) => {
  const e = eeOf(y), i = y >= 1999 ? iOf(y) : undefined;
  if (!e.ok) return '';
  if (!e.cashable) return `cashable from ${K.month(ymS(e.cashFrom))}`;
  if (e.penalty) return `penalty taken off: EE ${K.usd2(e.penaltyCost)}, I ${i && i.ok ? K.usd2(i.penaltyCost) : 'n/a'}`;
  if (e.stopped) return `EE stopped earning in ${K.month(ymS(e.finalMonth))}`;
  if (e.om !== undefined && e.om <= nowN) return `EE reached ${e.om - ymN(`${y}-01`) === K.P.bonds.eeDoublingMonths ? 'twice its price' : 'face value'} in ${K.month(ymS(e.om))}`;
  return '';
};
const rows = YEARS.map((y) => [`January ${y}`, `${v(eeOf(y))}${y > EE_PAPER_TO ? '*' : ''}`, y >= 1999 ? `${v(iOf(y))}${y > I_PAPER_TO ? '*' : ''}` : 'not sold', note(y)]);

// Worked figures.
const ee01 = K.bond('EE', '2001-01', NOW, 'paper', 100), i01 = K.bond('I', '2001-01', NOW, 'paper', 100);
const i99 = iOf(1999), ee15 = eeOf(2015), ee15rate = K.periods('EE', '2015-01', '2015-01')[0][1];
const penYears = YEARS.filter((y) => eeOf(y).penalty), penFrom = Math.min(...penYears);
const lockYears = YEARS.filter((y) => !eeOf(y).cashable);
const stoppedEE = YEARS.filter((y) => eeOf(y).stopped);
const cutoff = ymS(nowN - K.P.bonds.finalMaturityMonths);
const maxPen = (f: (y: number) => ReturnType<typeof K.bond>) => Math.max(...penYears.map((y) => f(y).penaltyCost));
// Paper and electronic side by side, and an odd electronic amount (TreasuryDirect's own example of $36.73).
const iPaper = K.bond('I', '2010-01', NOW, 'paper', 100), iElec = K.bond('I', '2010-01', NOW, 'electronic', 100);
const odd = 36.73, ee100e = K.bond('EE', '2015-01', NOW, 'electronic', 100), eeOdd = K.bond('EE', '2015-01', NOW, 'electronic', odd);
const oddRaw = ee100e.ok ? (odd / 100) * ee100e.value! : 0;
const yrs = (m: number) => m / 12;
// Latest run of EE windows (since May 2005) with a fixed rate under 1 %, and its range.
const EW = K.R.ee2005 as Array<[string, number]>;
let r1 = -1, r0 = -1;
for (let k = EW.length - 1; k >= 0; k--) { if (EW[k][1] < 0.01) { if (r1 < 0) r1 = k; r0 = k; } else if (r1 >= 0) break; }
const lowRates = EW.slice(r0, r1 + 1).map((w) => w[1]);
const lowEnd = ymS(ymN(EW[r1][0]) + 5);
const ee15double = ymS(ymN('2015-01') + K.P.bonds.eeDoublingMonths);
const youngest5 = penYears.length ? Math.min(...penYears) : nowY;
const fiveAt = (y: number) => ymS(ymN(`${y}-01`) + K.P.bonds.penaltyUntilMonths);

export default defineGuide({
  id: 'savings-bond-value',
  group: 'value',
  order: 10,
  slug: 'savings-bond-value',
  nav: 'Value table',
  card: 'What a $100 EE or I bond from each year is worth this month',
  title: 'Savings Bond Value 2026: Table by Issue Year, EE and I, US',
  description: `Savings bond value table for 2026: a $100 paper EE bond of January 2001 is worth ${v(ee01)} and an I bond of the same month ${v(i01)}. Every January since 1996.`,
  h1: 'Savings bond value table: every January from 1996 to today',
  intro: `What a ${K.usd(100)} Series EE bond and a ${K.usd(100)} Series I bond bought in January of each year are worth on ${on1(NOW)}, computed with the Treasury's own rounding rules.`,
  resume: `On ${on1(NOW)}, a ${K.usd(100)} paper EE bond issued in January 2001 is worth ${v(ee01)}: it cost ${K.usd2(ee01.price ?? 0)}, so ${K.usd2(ee01.interest ?? 0)} of that is interest. A ${K.usd(100)} I bond from the same month, bought at face value, is worth ${v(i01)}, and the oldest January I bond in the table, from 1999, reaches ${v(i99)}. The two series diverge because I bonds follow inflation while EE bonds earn a rate set by the Treasury; EE bonds bought when that rate was tiny barely moved, and one from January 2015 is worth ${v(ee15)} for ${K.usd2(ee15.price ?? 0)} paid at ${K.pct(ee15rate)}. Rows from ${penFrom} onward are under five years old, so their value already excludes the last three months of interest, and the row for January ${nowY} cannot be cashed yet. EE bonds issued in ${K.month(cutoff)} or earlier have passed 30 years and earn nothing more. For any month other than January, the calculator above gives the exact figure.`,
  faqs: [
    { q: 'Why is a $100 EE bond from the 2010s worth so little?', a: `EE bonds sold since May 2005 keep the rate set in their issue month, and from ${K.month(EW[r0][0])} to ${K.month(lowEnd)} that rate stayed between ${K.pct(Math.min(...lowRates))} and ${K.pct(Math.max(...lowRates))}. A bond of January 2015 earns ${K.pct(ee15rate)} a year on its ${K.usd2(ee15.price ?? 0)} price and is worth ${v(ee15)} today. It reaches twice its price only on its 20-year anniversary, in ${K.month(ee15double)}, when the Treasury adds the difference.` },
    { q: 'Is the value in the table what a bank will pay me?', a: 'Yes, for a bond that can be cashed: the redemption value is the full amount paid out, and it already includes every month of interest earned through the first of the month. A bank or TreasuryDirect pays that figure; the 1099-INT you receive later lists the interest part, which is the value minus the price. The table shows no tax withheld because none is withheld at redemption.' },
    { q: 'Does the table work for a $50 or $1,000 bond?', a: `Yes, by proportion. A paper bond is a whole number of units, so a ${K.usd(50)} bond is worth exactly half of the ${K.usd(100)} figure and a ${K.usd(1000)} bond ten times it, to the cent. Electronic bonds follow the same rule with a single rounding at the end. For an issue month other than January, use the calculator, because two bonds issued a few months apart can differ by several dollars.` },
    { q: 'Why do the newest rows of the value table show a penalty?', a: `The penalty depends on age, not on the calendar. A bond under five years old loses its last three months of interest when cashed, so the value shown for every January from ${youngest5} on already has that cut. The January ${youngest5} I bond, worth ${v(iOf(youngest5))}, carries a penalty of ${K.usd2(iOf(youngest5).penaltyCost)}, which disappears in ${K.month(fiveAt(youngest5))}, its fifth anniversary.` },
  ],
  body: (h) => `
<h2>January bonds from 1996 to ${nowY}, valued on ${on1(NOW)}</h2>
<p>Each row is a bond issued in January of the year shown. The EE column is a ${K.usd(100)} paper EE bond, the kind sold at half its face value from 1980 to 2012; after 2012 only electronic EE bonds exist, so those rows show an electronic bond bought for the same ${K.usd(50)}. The I column is a ${K.usd(100)} paper I bond through 2024 and an electronic one bought for ${K.usd(100)} from 2025, since paper I bonds ended with the 2024 tax refund program. Rows marked with an asterisk use the electronic form.</p>
${h.table(['Issued', 'EE, $100 face', 'I, $100', 'Note'], rows, `Value on ${on1(NOW)}, interest included, three-month penalty taken off where it applies. Method of 31 CFR 351 and 359, checked against the Treasury redemption tables. * electronic bond at the same price.`, ['l', 'r', 'r', 'l'])}
${h.mini('bond', { t: 'Any EE bond, any issue month', p: ['iy', 'amt'], d: { sr: 'EE', fm: 'paper', im: 7, iy: 1998, amt: 500 } })}

<h2>Reading one row: face value, price, interest</h2>
<p>Three numbers matter on a savings bond, and the table shows only the last one. The face value is the amount printed on a paper bond: ${K.usd(100)} in every row here. The price is what the buyer paid: ${K.usd(50)} for a paper EE bond, the full ${K.usd(100)} for an I bond. The value is the price plus all interest added so far, the amount a bank or the Treasury hands over. Interest, the figure that ends up on your tax return, is the value minus the price.</p>
<p>That is why a ${K.usd(100)} EE bond worth ${v(ee15)} is not a loss: the owner paid ${K.usd2(ee15.price ?? 0)} and has earned ${K.usd2(ee15.interest ?? 0)}. A face value is not a promise of what the bond is worth today. For EE bonds bought from May 1995 to May 2003 it is the amount reached at ${yrs(204)} years; for those from June 2003 onward it is twice the price, reached at ${yrs(K.P.bonds.eeDoublingMonths)} years. ${h.a('ee-bond-value', 'The EE value page')} walks through those four periods one by one.</p>

<h2>The young rows and the three-month rule</h2>
<p>Every bond from ${penFrom} through ${nowY} is under five years old on ${on1(NOW)}. Cash one now and the Treasury pays it as if it were three months younger: the last ${K.P.bonds.penaltyMonths} months of interest are dropped. The table already applies that cut, so the value shown is what you would actually receive. Across those rows the cut is at most ${K.usd2(maxPen(eeOf))} on an EE bond and ${K.usd2(maxPen(iOf))} on an I bond: small in dollars, because three months of interest on a young bond is little money. On the fifth anniversary the penalty simply disappears and the full value shows up on the next first of the month.</p>
<p>${lockYears.length ? `The ${lockYears.map((y) => `January ${y}`).join(' and ')} row${lockYears.length > 1 ? 's' : ''} cannot be cashed at all yet, because bonds issued since February 2003 must be held ${K.P.bonds.minHoldMonths} months.` : `No row is younger than ${K.P.bonds.minHoldMonths} months, the minimum holding period for bonds issued since February 2003.`} If you are weighing whether the penalty is worth paying on an I bond, ${h.a('cash-i-bonds-early', 'the cash or keep calculator')} sets it against what a new bond would earn.</p>

<h2>Rows that no longer move</h2>
<p>Savings bonds stop earning ${yrs(K.P.bonds.finalMaturityMonths)} years after their issue month. ${stoppedEE.length ? `In this table that is the January ${stoppedEE.join(' and January ')} EE row: its value is final and will be the same next year.` : 'No row of this table has reached that point yet.'} Any EE bond dated ${K.month(cutoff)} or earlier is in the same position, as are all the older Series E bonds and savings notes. ${h.a('matured-savings-bonds', 'Bonds that have stopped earning')} lists which issue dates are affected and how the tax works when they stop, and ${h.a('series-e-bond-value', 'the Series E table')} covers bonds from 1941 to 1980.</p>

<h2>Paper or electronic: where a cent can differ</h2>
<p>A paper bond is a stack of units, ${K.usd2(K.P.bonds.iUnit)} for Series I and ${K.usd2(K.P.bonds.eeUnit)} of price for Series EE, each grown and rounded on its own schedule. An electronic bond is valued differently: the Treasury takes the value of a ${K.usd(100)} bond and scales it to the exact amount paid, rounding once at the end. For round amounts the two methods land on the same cent. A ${K.usd(100)} I bond of January 2010 is worth ${v(iPaper)} on paper and ${v(iElec)} in electronic form.</p>
<p>Odd amounts are another matter. Electronic bonds can be bought to the penny, and TreasuryDirect gives ${K.usd2(odd)} as an example. An electronic EE bond of January 2015 at that price is worth ${K.dec(odd / 100, 4)} times the ${v(ee100e)} of a ${K.usd(100)} bond, or ${K.dec(oddRaw, 4)} dollars before rounding, paid as ${v(eeOdd)}. That single rounding is why an electronic holding can sit a cent away from the sum you would get by adding up paper denominations.</p>

<h2>When your bond is not from January</h2>
<p>Interest is added on the first day of each month and the rate changes every six months counted from the issue month, so a bond issued in July of a year is not worth the January figure. For I bonds the gap can be large, because a July bond and a January bond of the same year may carry different fixed rates. For EE bonds bought since May 2005 the rate itself depends on the six-month window of purchase. The tables above give the order of magnitude; the calculator at the top of the page takes the exact issue month, the face value or amount paid, and any month up to the end of the last announced rate period.</p>
${h.mini('bond', { t: 'An I bond bought in another month', p: ['im', 'iy'], d: { sr: 'I', fm: 'paper', im: 8, iy: 2003, amt: 1000 } })}
<p>For the rate each I bond earns this month, ${h.a('i-bond-rates', 'I bond rates')} has the table by issue window. To turn a value into cash, ${h.a('cash-savings-bonds', 'cashing a savings bond')} explains the bank and mail routes, and ${h.a('savings-bond-taxes', 'the tax page')} covers the federal return.</p>`,
  tool: 'bond',
  toolArg: { sr: 'EE', fm: 'paper', iy: 2001, im: 1, amt: 100 },
  related: ['ee-bond-value', 'i-bond-rates', 'matured-savings-bonds', 'paper-savings-bonds', 'cash-savings-bonds', 'savings-bond-taxes'],
  sources: ['fd_redemption', 'cfr_351', 'cfr_359', 'td_calc', 'td_eebonds'],
});
