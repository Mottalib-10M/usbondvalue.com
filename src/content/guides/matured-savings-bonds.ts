import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ymN = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const on1 = (s: string) => K.month(s).replace(' ', ' 1, ');
const NOW = K.BUILD, nowN = ymN(NOW);
const FM = K.P.bonds.finalMaturityMonths;
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');

// EE and I bonds issued in this month or earlier have reached 30 years.
const cutoff = ymS(nowN - FM);
// The next twelve issue months of EE bonds to stop earning, valued this month as $100 paper bonds.
const next = Array.from({ length: 12 }, (_, k) => ymS(nowN - FM + 1 + k)).map((issue) => ({ issue, r: K.bond('EE', issue, NOW, 'paper', 100) }));
const nextRows = next.map(({ issue, r }) => [K.month(issue), K.month(ymS(r.finalMonth)), v(r), r.rate === undefined ? 'n/a' : K.pct(r.rate)]);
const firstI = K.bond('I', '1998-09', NOW, 'paper', 100);
const iStop = ymS(firstI.finalMonth), iYearsLeft = Math.ceil((firstI.finalMonth - nowN) / 12);
const lastE = ymS(ymN('1980-06') + FM), lastSN = ymS(ymN('1970-10') + FM), lastOldEE = ymS(ymN('1995-04') + FM);
const hh = K.P.bonds.hhLastMaturity;
// The bond of the calculator: a $500 paper EE bond of July 1992.
const ex = K.bond('EE', '1992-07', NOW, 'paper', 500);
const exStop = ymS(ex.finalMonth);
const exInt = ex.interest ?? 0;
const taxAt = (inc: number) => K.fedTax(inc + exInt, 'single') - K.fedTax(inc, 'single');
const incEx = 48000;
const yrs = (m: number) => m / 12;

const seriesRows = [
  ['A, B, C, D, F, G, H, J, K', '1935 to 1979', '10 to 30 years', 'all stopped; paid at face value'],
  ['E', 'May 1941 to June 1980', '40 or 30 years', `stopped by ${K.month(lastE)}`],
  ['Savings notes', 'May 1967 to October 1970', '30 years', `stopped by ${K.month(lastSN)}`],
  ['HH', '1980 to August 2004', '20 years', `all stopped in ${K.month(hh)}`],
  ['EE', 'January 1980 to April 1995', '30 years', `all stopped by ${K.month(lastOldEE)}`],
  ['EE', 'May 1995 on', '30 years', `stopped if issued in ${K.month(cutoff)} or earlier`],
  ['I', 'September 1998 on', '30 years', `first ones stop in ${K.month(iStop)}`],
];

export default defineGuide({
  id: 'matured-savings-bonds',
  group: 'value',
  order: 50,
  slug: 'matured-savings-bonds',
  nav: 'Matured bonds',
  card: 'Which bonds have stopped earning, the tax year it triggers, and how to collect',
  title: 'Matured Savings Bonds 2026: Which Stopped Earning, US',
  description: `Matured savings bonds in 2026: EE bonds issued in ${K.month(cutoff)} or earlier earn nothing more, and their interest is taxed in the year they stop, cashed or not.`,
  h1: 'Matured savings bonds: the bonds that no longer earn interest',
  intro: `A savings bond stops earning on its final maturity date and keeps its last value with no time limit; what changes on that date is the tax year, not the money.`,
  resume: `On ${on1(NOW)}, every EE bond issued in ${K.month(cutoff)} or earlier has passed its ${yrs(FM)}-year final maturity and earns nothing more. So have all Series E bonds (the last stopped in ${K.month(lastE)}), all savings notes and all HH bonds, which ended in ${K.month(hh)}. No I bond has matured yet: the first ones, from September 1998, stop in ${K.month(iStop)}. A matured bond does not lose value and has no cashing deadline, but holding it brings no more interest. The tax point is the one owners miss: under IRS Publication 550, interest deferred on an EE, E or I bond is reportable in the year of final maturity even if the bond stays in a drawer. A ${K.usd(500)} paper EE bond of July 1992, for example, stopped in ${K.month(exStop)} at ${v(ex)}, of which ${K.usd2(exInt)} is interest belonging to that tax year. Electronic bonds are paid out automatically at maturity; paper bonds have to be presented to a bank or mailed to the Treasury.`,
  faqs: [
    { q: 'Do I owe tax on a savings bond that matured but was never cashed?', a: `Usually yes, for the year it matured. Publication 550 lets owners postpone the interest only until the bond is cashed, disposed of or reaches final maturity, whichever comes first. A bond that hit ${yrs(FM)} years in a past year carried its interest into that year's return. If that return left it out, the savings bond tax page explains the options; a tax professional can say whether an amended return applies.` },
    { q: 'Is there a deadline to cash a matured savings bond?', a: 'No. A paper bond that has stopped earning keeps its final value and can be cashed years later at the same amount, at a bank that cashes savings bonds or by mail with FS Form 1522. What a delay costs is interest you could have earned elsewhere, since the bond itself adds nothing. Electronic bonds are paid out automatically into the TreasuryDirect account on their maturity date.' },
    { q: 'Which savings bonds stop earning interest next?', a: `EE bonds whose issue month falls ${yrs(FM)} years back. Over the next year that means EE bonds issued from ${K.month(next[0].issue)} to ${K.month(next[next.length - 1].issue)}, each on the anniversary of its issue month. I bonds follow from ${K.month(iStop)}, starting with the very first ones sold in September 1998. HH bonds have all stopped, as have every E bond and every savings note.` },
    { q: 'How do I find savings bonds I have forgotten about?', a: 'TreasuryDirect has a page called Treasury Hunt that explains how to search for savings bonds you may own and have lost track of. For a paper bond whose serial number you know, the owner can also write to Treasury Retail Securities Services with the serial number and a signed letter to learn whether it was already cashed. Bonds of someone who has died follow the death of owner rules.' },
  ],
  body: (h) => `
<h2>Which series have stopped, on ${on1(NOW)}</h2>
<p>Every savings bond has a final maturity, the date interest stops. For EE and I bonds it falls ${yrs(FM)} years after the issue month, for HH bonds after 20 years, and for the E series after 40 or 30 years depending on the issue date. The table puts the series side by side as of this month (${h.src('td_oldseries', 'TreasuryDirect')}).</p>
${h.table(['Series', 'Sold', 'Earned for', 'Status'], seriesRows, `Final maturity by series, as of ${on1(NOW)}. Sources: TreasuryDirect, Historical and retired bonds; HH bonds; IRS Publication 550.`, ['l', 'l', 'l', 'l'])}
<p>The only bonds still earning are EE bonds issued after ${K.month(cutoff)} and all I bonds. Everything else in a box of old bonds is at its final value. ${h.a('series-e-bond-value', 'The Series E table')} gives the final amount of each E bond by year, and the calculator above handles EE, E, I and savings notes.</p>

<h2>The next EE bonds to stop</h2>
<p>A month passes, and one more issue month of EE bonds reaches ${yrs(FM)} years. The twelve below are the next ones in line. The value is what a ${K.usd(100)} paper bond is worth this month; the rate is the one it earns until it stops. Bonds of May 1995 to April 1997 credit interest only every six months, so for them the last credit before the stop date is the one that counts.</p>
${h.table(['Issued', 'Stops earning', 'Value now, $100 face', 'Rate now'], nextRows, `$100 paper EE bonds valued on ${on1(NOW)}. Interest stops on the first day of the month shown.`, ['l', 'l', 'r', 'r'])}
<p>I bonds have more time. The very first ones, issued in September 1998, stop in ${K.month(iStop)}, about ${iYearsLeft} year${iYearsLeft > 1 ? 's' : ''} from now, and they still earn ${firstI.rate === undefined ? 'their composite rate' : K.pct(firstI.rate)} in their current period, carried by a fixed rate of ${K.pct(K.iFixed('1998-09'))}.</p>
${h.mini('bond', { t: 'Has this EE bond stopped earning?', p: ['im', 'iy'], d: { sr: 'EE', fm: 'paper', im: 3, iy: 1989, amt: 100 } })}

<h2>The tax year is the year of maturity</h2>
<p>Most owners never report savings bond interest until the money arrives. IRS Publication 550 calls that method 1 and sets its limit: the interest is reported for the year the bond is cashed, disposed of or reaches final maturity, whichever is earliest (${h.src('irs_p550', 'IRS Publication 550')}). Final maturity is therefore a taxable moment even for a bond nobody touches. The ${K.usd(500)} paper EE bond of July 1992 that the calculator starts on reached ${yrs(FM)} years in ${K.month(exStop)}; its ${K.usd2(exInt)} of interest belonged on the return for ${exStop.slice(0, 4)}.</p>
<p>The paperwork does not always follow. When a paper bond is cashed later, the bank or the Treasury issues a 1099-INT for the year of cashing, which may not be the year the interest was due. HH bonds had their own version of the problem: deferred interest printed on an HH bond that matured in ${K.month(hh)} was reportable for ${hh.slice(0, 4)} whether or not the bond was redeemed (${h.src('td_hh', 'TreasuryDirect')}). Interest on all of these bonds is exempt from state and local income tax.</p>
${h.mini('bondtax', { t: 'Federal tax on the interest of a matured bond', p: ['inc'], d: { int: exInt, inc: incEx, st: 'single' } })}
<p>With ${K.usd(incEx)} of other taxable income, a single filer would owe about ${K.usd(taxAt(incEx))} of federal tax on that ${K.usd2(exInt)}, at 2026 brackets. ${h.a('savings-bond-taxes', 'Savings bond taxes')} goes through the two reporting methods and what to do when the 1099-INT and the maturity year disagree.</p>

<h2>Collecting a matured bond</h2>
<p>Electronic bonds take care of themselves: on the maturity date TreasuryDirect pays the value into the account's Certificate of Indebtedness, from which it can be moved to a bank account or used for new purchases. Paper bonds must be presented. A bank that cashes savings bonds will ask for identification and set its own limit per visit; the Treasury takes any amount by mail with FS Form 1522 (${h.src('td_form1522', 'the form')}), with a certified signature above ${K.usd(K.P.bonds.signatureCertificationOver)}. Bonds of the older series A, B, C, D, F, G, H, J and K follow a different path: TreasuryDirect asks for them to be mailed with FS Form 1522 and pays their face value by direct deposit, keeping any legal evidence sent with them. ${h.a('cash-savings-bonds', 'Cashing savings bonds')} covers the EE and I routes step by step.</p>
<p>A matured paper bond can also be converted in TreasuryDirect; it is cashed on arrival and the money lands in the Certificate of Indebtedness, which pays no interest. Waiting has no penalty and no deadline. It simply earns nothing.</p>

<h2>Bonds nobody has claimed</h2>
<p>Bonds bought as gifts decades ago, or registered to a child who has since grown up, are easy to lose track of, and a matured bond that sits forgotten still holds its full final value. TreasuryDirect points owners to Treasury Hunt, its page on searching for savings bonds you may have forgotten (${h.src('td_oldseries', 'TreasuryDirect')}). For a specific paper bond, the owner can ask Treasury Retail Securities Services by letter, with the serial number, whether it has been cashed; the bond itself should not be mailed for that question. Bonds found after a death pass under ${h.a('inherited-savings-bonds', 'the rules for inherited bonds')}, and the interest question shifts to the heir and the estate.</p>`,
  tool: 'bond',
  toolArg: { sr: 'EE', fm: 'paper', iy: 1992, im: 7, amt: 500 },
  related: ['series-e-bond-value', 'savings-bond-taxes', 'cash-savings-bonds', 'inherited-savings-bonds', 'ee-bond-value'],
  sources: ['td_oldseries', 'td_retired', 'td_hh', 'irs_p550', 'td_tax', 'td_form1522'],
});
