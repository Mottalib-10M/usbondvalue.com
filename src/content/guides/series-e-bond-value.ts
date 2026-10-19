import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ymN = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const NOW = K.BUILD;
const E = (issue: string, face = 100) => K.bond('E', issue, NOW, 'paper', face);
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');

// Final value of a $100 Series E bond issued in January of each year (May for 1941), from the Treasury table of May 2023.
const YEARS = Array.from({ length: 1980 - 1942 + 1 }, (_, k) => 1942 + k);
const series = YEARS.map((y) => ({ y, r: E(`${y}-01`) }));
const rows = [{ y: 1941, r: E('1941-05') }, ...series].map(({ y, r }) => [y === 1941 ? 'May 1941' : `January ${y}`, K.usd2(r.price ?? 0), v(r), K.dec((r.value ?? 0) / (r.price ?? 1), 1), K.month(ymS(r.finalMonth))]);
const best = series.reduce((a, b) => ((b.r.value ?? 0) > (a.r.value ?? 0) ? b : a));
const e65 = E('1965-01'), e66 = E('1966-01'), e65n = E('1965-11'), e65d = E('1965-12');
const e55q = E('1955-01', 25), e75 = E('1975-01'), e80 = E('1980-06');
const lastStop = ymS(e80.finalMonth);
const yrs = (r: ReturnType<typeof K.bond>, issue: string) => (r.finalMonth - ymN(issue)) / 12;
// A year of $25 bonds bought every month of 1960, as through a payroll plan.
const y60 = Array.from({ length: 12 }, (_, k) => E(`1960-${String(k + 1).padStart(2, '0')}`, 25));
const y60v = y60.reduce((t, r) => t + (r.value ?? 0), 0), y60p = y60.reduce((t, r) => t + (r.price ?? 0), 0);
const y60lo = Math.min(...y60.map((r) => r.value ?? 0)), y60hi = Math.max(...y60.map((r) => r.value ?? 0));
const sn68 = K.bond('SN', '1968-01', NOW, 'paper', 100), sn70 = K.bond('SN', '1970-10', NOW, 'paper', 100);

export default defineGuide({
  id: 'series-e-bond-value',
  group: 'value',
  order: 40,
  slug: 'series-e-bond-value',
  nav: 'Series E bonds',
  card: 'Final value of every Series E bond, 1941 to 1980, and of savings notes',
  title: 'Series E Bond Value 2026: Final Value by Issue Year, US',
  description: `Series E bond value in 2026: every E bond has stopped earning, and a $100 bond of January 1965, bought for $75, is worth ${v(e65)}. Values from 1941 to 1980.`,
  h1: 'Series E bond value: the final amount of every bond from 1941 to 1980',
  intro: `Series E bonds were sold from May 1941 to June 1980; none of them earns interest today, so each one is worth a fixed final amount that will not change.`,
  resume: `Every Series E bond has reached final maturity, the last ones in ${K.month(lastStop)}, so its value is now a fixed number. A ${K.usd(100)} E bond cost ${K.usd(75)}, three quarters of its face value. Bonds issued from May 1941 to November 1965 earned for ${yrs(e65n, '1965-11')} years and those from December 1965 to June 1980 for ${yrs(e65d, '1965-12')}, which is why a ${K.usd(100)} bond of January 1965 is worth ${v(e65)} while one of January 1966 is worth ${v(e66)}. That 1965 bond returned ${K.dec((e65.value ?? 0) / (e65.price ?? 1), 1)} times its price. A bond of January 1975 is worth ${v(e75)} and the last one sold, June 1980, ${v(e80)}. These values come from the final Treasury redemption table, published in May 2023, and they apply in proportion to any denomination: a ${K.usd(25)} bond of January 1955 is worth ${v(e55q)}. Savings notes, sold from 1967 to 1970 at ${K.pct(0.81, 0)} of face, have stopped too: ${v(sn68)} for a ${K.usd(100)} note of January 1968.`,
  faqs: [
    { q: 'How much is a $25 Series E bond from the 1950s worth?', a: `About ${K.dec((e55q.value ?? 0) / (e55q.price ?? 1), 0)} times what it cost, depending on the month. The bond cost ${K.usd2(e55q.price ?? 0)}; one issued in January 1955 is worth ${v(e55q)}, a final amount that will not grow. Other months of the decade land nearby but not on the same cent, because each issue month followed its own rate history. The calculator gives the exact figure for any month from May 1941 to June 1980.` },
    { q: 'Why is a 1965 E bond worth more than a 1966 one?', a: `Because of when interest stopped, not because of the rate. E bonds issued through November 1965 earned for ${yrs(e65n, '1965-11')} years, those from December 1965 for ${yrs(e65d, '1965-12')}. A ${K.usd(100)} bond of November 1965 ended at ${v(e65n)}; one issued a month later, in December 1965, ended at ${v(e65d)}. Ten extra years of compounding account for most of the gap.` },
    { q: 'Where can I cash a Series E bond today?', a: 'At a bank or credit union that cashes savings bonds, with proof of your identity, and with a certified death certificate if you are cashing as a beneficiary. You can also mail the bond to the Treasury with FS Form 1522. A Series E bond can be converted into an electronic holding in TreasuryDirect too, but since it no longer earns, the Treasury pays it out as soon as it arrives.' },
    { q: 'Are savings notes the same thing as Series E bonds?', a: `No, they were a separate security sold alongside E bonds from May 1967 to October 1970, also called Freedom Shares. They cost ${K.pct(0.81, 0)} of face value rather than ${K.pct(0.75, 0)}, came in small denominations and earned for 30 years. All of them have stopped earning; a ${K.usd(100)} note of October 1970, the last month, is worth ${v(sn70)}.` },
  ],
  body: (h) => `
<h2>Final value of a $100 Series E bond, by issue year</h2>
<p>Each row is a ${K.usd(100)} E bond bought for ${K.usd(75)}. The value is final: it is what a bank or the Treasury pays today and what it will pay in ten years. The multiple column divides that value by the price, which is the easiest way to see what the bond returned over its life. The last column is the month interest stopped. For a bond of another denomination, scale the figure: a ${K.usd(50)} bond is worth half, a ${K.usd(1000)} bond ten times.</p>
${h.table(['Issued', 'Price', 'Final value', 'Multiple of price', 'Interest stopped'], rows, 'Series E, $100 face value. Final values from the Treasury savings bond redemption table of May 2023 (Fiscal Data). Bonds issued in other months differ by a few dollars.', ['l', 'r', 'r', 'r', 'l'])}

<h2>Forty years or thirty: the November 1965 line</h2>
<p>The single biggest break in the table is between 1965 and 1966, and it comes first from the length of the earning period rather than from the rates. E bonds issued from May 1941 through November 1965 were extended until they had earned for ${yrs(e65n, '1965-11')} years; bonds issued from December 1965 on stopped at ${yrs(e65d, '1965-12')} years (${h.src('td_retired', 'TreasuryDirect')}). A November 1965 bond therefore compounded for a decade longer than its neighbor of December, and ended at ${v(e65n)} against ${v(e65d)}.</p>
<p>That rule also explains why the oldest bonds are not the most valuable. A bond from January 1942 stopped in ${K.month(ymS(series[0].r.finalMonth))} at ${v(series[0].r)}, while a bond from ${best.y} kept compounding until ${K.month(ymS(best.r.finalMonth))}, through a later and different run of rates. The peak of the table, ${v(best.r)} for January ${best.y}, sits right at the end of the forty-year group.</p>
${h.mini('bond', { t: 'Final value of an E bond from any month', p: ['im', 'iy'], d: { sr: 'E', fm: 'paper', im: 6, iy: 1958, amt: 50 } })}

<h2>Why the value no longer changes</h2>
<p>Interest on a savings bond stops at final maturity, and every Series E bond passed that point by ${K.month(lastStop)}. The Treasury kept printing the amounts in its monthly redemption tables until May 2023, the last table it published (${h.src('fd_redemption', 'Fiscal Data')}); those amounts are the ones the calculator uses, so the figure you see is the redemption value, interest included, to the cent. Holding a Series E bond longer earns nothing. It does not lose value either, and no deadline forces it to be cashed.</p>
<p>The denominations ran from ${K.usd(25)} to ${K.usd(100000)} over the life of the series, and every one of them follows the same ${K.pct(0.75, 0)} price, so a ${K.usd(25)} bond cost ${K.usd2(e55q.price ?? 0)} and is worth a quarter of the figure in the table. The value depends only on the issue month and the face value; the serial number, the owner's name and the place of purchase change nothing.</p>
<p>A stack of small bonds is added up one by one, because each month has its own figure. Twelve ${K.usd(25)} bonds bought one a month through 1960 cost ${K.usd2(y60p)} in all and are worth ${K.usd2(y60v)} together, with single bonds ranging from ${K.usd2(y60lo)} to ${K.usd2(y60hi)}. The Treasury's own Savings Bond Calculator prices Series E bonds and savings notes as well, one bond at a time (${h.src('td_calc', 'TreasuryDirect')}); the calculator on this page takes the same inputs and returns the same final amounts.</p>

<h2>Cashing an E bond, and the tax that comes with it</h2>
<p>A Series E bond can be cashed at any financial institution that offers the service, with identification, or by mail to the Treasury with FS Form 1522 (${h.src('td_form1522', 'the form')}). The bank or the Treasury issues a 1099-INT for the year the bond is cashed, showing the difference between the value and the price as interest. The interest is subject to federal income tax and exempt from state and local income tax.</p>
<p>The IRS describes two ways of reporting savings bond interest in Publication 550 (${h.src('irs_p550', 'IRS')}). Most owners use the first, which postpones the interest to the year the bond is cashed, disposed of or reaches final maturity, whichever comes first. For an E bond, final maturity came decades ago, so an owner who never reported the interest faces a year that has already passed. ${h.a('savings-bond-taxes', 'The savings bond tax page')} sets out how the 1099-INT and the return fit together, and ${h.a('inherited-savings-bonds', 'inherited savings bonds')} covers the common case where the E bond came from a parent or grandparent.</p>

<h2>Savings notes, the 1967 to 1970 cousin</h2>
<p>Savings notes, sold as Freedom Shares from May 1967 to October 1970, were bought alongside E bonds and earned for 30 years. They cost ${K.pct(0.81, 0)} of face value, so a ${K.usd(100)} note cost ${K.usd2(sn68.price ?? 0)}. Every one of them stopped earning by ${K.month(ymS(sn70.finalMonth))}. A note from January 1968 is worth ${v(sn68)}, one from October 1970 ${v(sn70)}, and they are cashed the same way as E bonds.</p>
${h.mini('bond', { t: 'Final value of a savings note', p: ['im', 'iy'], d: { sr: 'SN', fm: 'paper', im: 11, iy: 1968, amt: 25 } })}
<p>For EE bonds, which replaced the E series in 1980, see ${h.a('ee-bond-value', 'EE bond value')}; for every series that has stopped earning, including the HH bonds, ${h.a('matured-savings-bonds', 'matured savings bonds')}; and for reading the face of an old bond, ${h.a('paper-savings-bonds', 'paper savings bonds')}.</p>`,
  tool: 'bond',
  toolArg: { sr: 'E', fm: 'paper', iy: 1970, im: 1, amt: 100 },
  related: ['matured-savings-bonds', 'paper-savings-bonds', 'inherited-savings-bonds', 'savings-bond-taxes', 'cash-savings-bonds'],
  sources: ['td_retired', 'fd_redemption', 'td_oldseries', 'td_form1522', 'irs_p550'],
});
