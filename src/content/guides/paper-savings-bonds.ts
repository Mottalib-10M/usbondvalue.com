import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const on1 = (s: string) => K.month(s).replace(' ', ' 1, ');
const NOW = K.BUILD;
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');
type S = 'I' | 'EE' | 'E' | 'SN';
const NAME: Record<S, string> = { I: 'Series I', EE: 'Series EE', E: 'Series E', SN: 'Savings note' };

// Price of a $100 face paper bond in each series, from the engine.
const price = (s: S, issue: string) => K.bond(s, issue, issue, 'paper', 100).price ?? 0;
const prices: Array<[S, string, string]> = [['EE', '1980 to 2012', '1990-01'], ['I', '1998 to 2024', '2005-01'], ['E', 'May 1941 to June 1980', '1960-01'], ['SN', 'May 1967 to October 1970', '1968-01']];
const priceRows = prices.map(([s, when, at]) => [NAME[s], when, K.usd2(price(s, at)), K.pct(price(s, at) / 100, 0)]);

// A drawer of five paper bonds, valued this month.
const drawer: Array<[S, string, number]> = [['I', '2001-04', 200], ['EE', '1998-03', 100], ['EE', '2009-11', 75], ['E', '1975-06', 25], ['SN', '1969-05', 50]];
const valued = drawer.map(([s, issue, face]) => ({ s, issue, face, r: K.bond(s, issue, NOW, 'paper', face) }));
const total = valued.reduce((t, x) => t + (x.r.ok ? x.r.value! : 0), 0);
const paid = valued.reduce((t, x) => t + (x.r.ok ? x.r.price! : 0), 0);
const drawerRows = valued.map((x) => [NAME[x.s], K.month(x.issue), K.usd(x.face), K.usd2(x.r.price ?? 0), v(x.r), x.r.stopped ? `stopped ${K.month(ymS(x.r.finalMonth))}` : `earning until ${K.month(ymS(x.r.finalMonth))}`]);
const earning = valued.filter((x) => !x.r.stopped).length, stopped = valued.length - earning;
const over = valued.filter((x) => x.r.ok && x.r.value! > K.P.bonds.signatureCertificationOver);
const i01 = valued[0].r, i01e = K.bond('I', '2001-04', NOW, 'electronic', 200);
const den = (l: number[]) => l.map((x) => K.usd(x)).join(', ');
const short = (s: S) => (s === 'SN' ? 'savings note' : `${s} bond`);
const iFix = K.iFixed('2001-04');

export default defineGuide({
  id: 'paper-savings-bonds',
  group: 'value',
  order: 30,
  slug: 'paper-savings-bonds',
  nav: 'Paper bonds',
  card: 'Reading, valuing, cashing and converting the bonds in a drawer',
  title: 'Paper Savings Bonds 2026: Read, Value, Cash, Convert, US',
  description: `Paper savings bonds in 2026: what the issue date and face value mean, what each series cost, and a $200 paper I bond of April 2001 worth ${v(i01)} today.`,
  h1: 'Paper savings bonds: what is printed on them and what they are worth',
  intro: `No paper savings bond has been sold since the end of 2024, yet many remain in drawers and safe deposit boxes, each with an issue date, a face value and a value that is rarely either.`,
  resume: `A paper savings bond shows four things that matter: its series, its face value, its issue month and year, and the owner's name. The issue date starts the clock for interest; the face value is not what the bond is worth. Each series sold at its own share of face: ${K.pct(price('EE', '1990-01') / 100, 0)} for EE bonds, ${K.pct(price('I', '2005-01') / 100, 0)} for I bonds, ${K.pct(price('E', '1960-01') / 100, 0)} for the old Series E and ${K.pct(price('SN', '1968-01') / 100, 0)} for savings notes. A ${K.usd(200)} paper I bond issued in April 2001 is worth ${v(i01)} on ${on1(NOW)}, for ${K.usd2(i01.price ?? 0)} paid. A paper bond can be cashed only for its full value, at a bank that offers the service or by mail to the Treasury with FS Form 1522, with a certified signature above ${K.usd(K.P.bonds.signatureCertificationOver)}. EE and I paper bonds can also be converted, free and for good, into electronic bonds in a TreasuryDirect account, as long as the back of the bond is left unsigned.`,
  faqs: [
    { q: 'Where is the issue date on a paper savings bond?', a: 'On the face of the bond, near the upper right corner, as a month and a year. The Treasury dates every bond to the first day of the month in which it received the payment, whatever day the buyer paid, and interest counts from that first day. The face also shows the serial number, the denomination and the names of the owner and of any co-owner or beneficiary.' },
    { q: 'Can I cash only part of a paper savings bond?', a: `No. A paper bond is paid for its entire value or not at all. If you want to take out part of the money, the route is to convert the bond into an electronic one in TreasuryDirect first: electronic bonds can be cashed in part, from ${K.usd(K.P.bonds.electronicMin)} to the penny, as long as at least ${K.usd(K.P.bonds.electronicMin)} stays in the bond. The conversion itself is free and keeps the issue date.` },
    { q: 'Can I still buy a paper savings bond?', a: 'No. Paper EE bonds stopped selling in 2012, and paper I bonds, which could still be bought with a federal tax refund, ended on December 31, 2024. Every savings bond sold since January 1, 2025 is electronic, held in a TreasuryDirect account. The paper bonds already issued remain valid and keep earning interest until they are 30 years old.' },
    { q: 'Can I cash a paper bond I bought at an online auction?', a: 'No. TreasuryDirect warns that it pays a bond only to its owner or co-owner, or to someone with legal evidence that the Treasury accepts, such as proof of inheritance. A bond bought from a stranger or on an auction site cannot be cashed by the buyer. If you hold bonds after a death in the family, the death of owner rules apply instead.' },
  ],
  body: (h) => `
<h2>What the face of the bond tells you</h2>
<p>Start with the series, printed in large letters: EE, I, E, or the words Savings Note. Then the face value, the denomination in the corner. Then the issue date, a month and a year near the upper right; the Treasury counts interest from the first day of that month. The bond also names its owner and, on many bonds, a co-owner or a beneficiary marked POD (payable on death). The serial number is what the Treasury uses to find a bond in its records, and it is worth writing down before the bonds go anywhere.</p>
<p>Some bonds carry a special name. Paper EE bonds sold from December 2001 to December 2011 may say Patriot Bond; paper I bonds sold from March 2006 to September 2007 may say Gulf Coast Recovery Bond. Both names were a designation, nothing more: the rules, the rates and the value are those of an ordinary EE or I bond of the same month (${h.src('td_retired', 'TreasuryDirect')}).</p>

<h2>What each series cost</h2>
<p>The face value is a fixed multiple of the price, and the multiple depends on the series. Knowing it tells you how much interest a bond holds, because interest is the value minus the price.</p>
${h.table(['Series', 'Sold on paper', 'Price of $100 face', 'Share of face'], priceRows, 'Issue prices of paper savings bonds (TreasuryDirect, 31 CFR 351 and 359).', ['l', 'l', 'r', 'r'])}
<p>Paper EE bonds came in ${den(K.P.bonds.paperDenominationsEE)} of face value; paper I bonds in ${den(K.P.bonds.paperDenominationsI)}. A ${K.usd(1000)} EE bond therefore cost ${K.usd(500)}, while a ${K.usd(1000)} I bond cost the full ${K.usd(1000)}. Paper EE bonds were sold from 1980 to 2012. Paper I bonds were sold at banks and through payroll plans until 2012, then only with federal tax refunds until December 31, 2024.</p>
${h.mini('bond', { t: 'A Patriot Bond or any paper EE bond', p: ['amt', 'iy'], d: { sr: 'EE', fm: 'paper', im: 12, iy: 2011, amt: 1000 } })}

<h2>A drawer of five bonds, valued on ${on1(NOW)}</h2>
<p>Families often hold a mix: an I bond from the early 2000s, a few EE bonds from birthdays, an E bond and a savings note inherited from grandparents. The five below show how differently they behave: ${earning} of the five still earn interest; ${stopped} stopped years ago and hold a frozen final value.</p>
${h.table(['Series', 'Issued', 'Face', 'Price', 'Value', 'Status'], drawerRows, `Value on ${on1(NOW)}. Together: ${K.usd2(total)} for ${K.usd2(paid)} paid.`, ['l', 'l', 'r', 'r', 'r', 'l'])}
<p>The I bond is worth far more than its face value because it carries a fixed rate of ${K.pct(iFix)} on top of inflation, set in its issue month and kept for 30 years. The 2009 EE bond is worth less than its face value and will stay below it until its 20th anniversary. The E bond and the savings note have stopped: holding them longer adds nothing. Each line of the table is one entry in the calculator above, which takes the series, the issue month and year, and the face value.</p>

<h2>Cashing a paper bond</h2>
<p>A paper bond is cashed in full or not at all. The first route is a bank where you have an account: ask whether it cashes savings bonds, how much it will pay at one time and which documents it needs, because banks set their own limits and some do not offer the service. The second route is the Treasury by mail, with FS Form 1522 (${h.src('td_form1522', 'the form')}); it has no limit on the amount, but above ${K.usd(K.P.bonds.signatureCertificationOver)} your signature must be certified, at a bank or by another authorized officer. ${over.length ? `In the drawer above, the ${over.map((x) => short(x.s)).join(' and ')} alone ${over.length > 1 ? 'are' : 'is'} over that line.` : total > K.P.bonds.signatureCertificationOver ? `The line counts the bonds cashed together: mailed as one request, the five bonds of the drawer come to ${K.usd2(total)}, so the signature would need certifying.` : ''}</p>
<p>The bank or the Treasury then reports the interest on a 1099-INT. A bank may hand it over at once or send it the following January; the Treasury mails it the following January. Interest is subject to federal income tax but not to state or local income tax. ${h.a('cash-savings-bonds', 'Cashing savings bonds')} goes through each route, and ${h.a('savings-bond-taxes', 'savings bond taxes')} explains the return.</p>

<h2>Converting paper into electronic</h2>
<p>EE and I paper bonds can be exchanged for electronic bonds in TreasuryDirect at no charge beyond postage (${h.src('td_convert', 'TreasuryDirect')}). In the account, under ManageDirect, you set up a Conversion Linked Account, follow the instructions for converting paper bonds and mail the bonds in. Do not sign the back of a bond sent for conversion; a signature is for cashing. The bond keeps its owner, its issue date, its rate and its maturity, and the exchange is not a taxable event while it still earns interest. It cannot be undone: an electronic bond never goes back to paper.</p>
<p>Once electronic, the bond can be cashed in part, is paid automatically at 30 years, and cannot be lost in a fire. Matured E, EE and I bonds can also be converted; the Treasury cashes them on arrival and places the money in the account's Certificate of Indebtedness, a balance that earns nothing. H and HH bonds cannot be converted.</p>

<h2>Paper against electronic: the same value, almost always</h2>
<p>Paper and electronic bonds follow the same rates and the same units, so the conversion does not change what a bond is worth. The ${K.usd(200)} I bond of April 2001 is worth ${v(i01)} on paper and ${v(i01e)} as an electronic bond of the same price. A difference of a cent can appear only on electronic amounts that are not a round multiple of a unit, because an electronic value is scaled from a ${K.usd(100)} bond and rounded once. ${h.a('savings-bond-value', 'The value table')} explains that rounding with an example.</p>
${h.mini('bond', { t: 'A Gulf Coast Recovery Bond or any paper I bond', p: ['amt'], d: { sr: 'I', fm: 'paper', im: 9, iy: 2007, amt: 75 } })}
<p>If you are not sure whether an old paper bond was already cashed, check first with your bank; if it cannot tell, the owner can write to Treasury Retail Securities Services, P.O. Box 9150, Minneapolis, MN 55480-9150, with the serial numbers and a signed letter, without sending the bonds. Bonds received after a death follow ${h.a('inherited-savings-bonds', 'the inherited bond rules')}.</p>`,
  tool: 'bond',
  toolArg: { sr: 'I', fm: 'paper', iy: 2001, im: 4, amt: 200 },
  related: ['savings-bond-value', 'cash-savings-bonds', 'series-e-bond-value', 'inherited-savings-bonds', 'savings-bond-taxes'],
  sources: ['td_convert', 'td_cashing', 'td_form1522', 'td_retired', 'td_calc', 'cfr_351', 'cfr_359'],
});
