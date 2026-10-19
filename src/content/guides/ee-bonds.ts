import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ymN = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const on1 = (s: string) => K.month(s).replace(' ', ' 1, ');
const add = (s: string, m: number) => ymS(ymN(s) + m);
const B = K.P.bonds;
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');

const cur = K.R.eeCurrent, from = K.LAST, to = add(K.NEXT, -1);
const EW = K.R.ee2005 as Array<[string, number]>;
const prev = EW[EW.length - 2];
const hi = EW.reduce((a, b) => (b[1] > a[1] ? b : a)), lo = Math.min(...EW.map((w) => w[1]));
const atLo = EW.filter((w) => w[1] === lo).length;
const win = (m: string) => `${K.month(m)} to ${K.month(add(m, 5))}`;
const histRows = EW.slice(-8).reverse().map(([m, r]) => [win(m), `<strong>${K.pct(r)}</strong>`, K.usd2(K.bond('EE', m, add(m, B.eeDoublingMonths - 1), 'electronic', 1000).value ?? 0)]);
const dbl = Math.pow(2, 1 / (B.eeDoublingMonths / 12)) - 1;

// A $1,000 electronic EE bond bought in the current window: its first years.
const amt = 1000;
const life = [B.minHoldMonths, 24, B.penaltyUntilMonths - 1, B.penaltyUntilMonths].map((k) => ({ k, r: K.bond('EE', from, add(from, k), 'electronic', amt) }));
const lifeRows = life.map(({ k, r }) => [on1(add(from, k)), `${k} months`, v(r), r.penalty ? K.usd2(r.penaltyCost) : 'none']);
const y5 = life[3].r, y5m = life[2].r;
// The calculator's bond: May 2010.
const m10 = K.periods('EE', '2010-05', '2010-05')[0][1];
const m10om = add('2010-05', B.eeDoublingMonths);

export default defineGuide({
  id: 'ee-bonds',
  group: 'value',
  order: 70,
  slug: 'ee-bonds',
  nav: 'EE bonds',
  card: 'Rate, limits and rules of the EE bonds sold today',
  title: 'EE Bonds 2026: Current Rate, Yearly Limit and Rules, US',
  description: `EE bonds in 2026: new bonds earn a fixed ${K.pct(cur)} through ${K.month(to)}, up to ${K.usd(B.annualLimitElectronicEE)} a year per person, electronic only from ${K.usd(B.electronicMin)}, and double at 20 years.`,
  h1: 'EE bonds: the rate, the limits and the rules for bonds bought now',
  intro: `Series EE bonds are sold only in TreasuryDirect, at a rate fixed on the day of purchase, and the Treasury makes each one worth twice its price after 20 years.`,
  resume: `EE bonds bought from ${win(from)} earn a fixed ${K.pct(cur)} a year, set at purchase and kept for at least 20 years, after ${K.pct(prev[1])} in the previous six months. They are electronic only, held in a TreasuryDirect account, and cost any amount from ${K.usd(B.electronicMin)} to the penny, up to ${K.usd(B.annualLimitElectronicEE)} per Social Security number per calendar year, a limit separate from the ${K.usd(B.annualLimitElectronicI)} for I bonds. Interest is added monthly and compounds every six months. A bond cannot be cashed in its first ${B.minHoldMonths} months, and before five years the last three months of interest are lost. The feature that sets EE bonds apart is the 20-year doubling: whatever the rate, the Treasury raises the value to twice the price on the 20th anniversary, which equals ${K.pct(dbl)} a year for the patient owner. Interest stops at 30 years. It is subject to federal income tax but not to state or local tax, and it may be tax-free when used for college costs.`,
  faqs: [
    { q: 'What rate do EE bonds bought this month earn?', a: `A fixed ${K.pct(cur)} for bonds issued from ${win(from)}. The rate is set by the Treasury every May 1 and November 1 for the next six months of purchases, and the bond keeps the rate of its own issue month. The next announcement is on ${K.day(K.P.nextIBond.date)}; a bond bought before then keeps ${K.pct(cur)} whatever the new rate turns out to be.` },
    { q: 'How much can one person put into EE bonds in a year?', a: `Up to ${K.usd(B.annualLimitElectronicEE)} of electronic EE bonds per calendar year, counted on the Social Security number of the first person named on the bond. The I bond limit of ${K.usd(B.annualLimitElectronicI)} is separate, so one person can buy both. A trust or a business with its own tax ID has its own limit, and a bond given as a gift counts for the person who receives it, in the year it is delivered.` },
    { q: 'Can an EE bond lose money?', a: `No. Its value never falls below the price paid, and interest once added is not taken back, except that a bond cashed before five years gives up its last three months of interest. A bond cashed at ${B.minHoldMonths} months may return little more than its price, as the early-years table shows. Inflation can erode what the money buys, which is the risk EE bonds do not cover and I bonds do.` },
    { q: 'Is the EE bond rate fixed for all 30 years?', a: 'TreasuryDirect states that bonds issued since May 2005 earn their fixed rate for the first 20 years and that it may adjust the rate or the way they earn interest after 20 years. The doubling on the 20th anniversary is part of the terms of the bond (31 CFR 351). Years 21 to 30 continue to earn interest on the doubled value, at the rate the Treasury applies then.' },
  ],
  body: (h) => `
<h2>The rate for new EE bonds, and its recent history</h2>
<p>The Treasury announces the EE rate on May 1 and November 1, and every bond bought in the six months that follow keeps that rate (${h.src('td_ee2005', 'TreasuryDirect')}). Since the switch to fixed rates in May 2005, the rate has ranged from ${K.pct(hi[1])}, for bonds of ${win(hi[0])}, down to ${K.pct(lo)}, a level it held for ${atLo} windows. The last eight windows are below, with what ${K.usd(1000)} would be worth one month before its 20th anniversary at that rate alone.</p>
${h.table(['Bought in', 'Fixed rate', '$1,000 after 19 years 11 months'], histRows, 'Rates for new Series EE bonds by six-month window (TreasuryDirect). The third column leaves out the doubling step, which comes one month later.', ['l', 'r', 'r'])}
<p>Comparing the third column with ${K.usd(2000)} shows how much each window depends on the doubling. At ${K.pct(cur)}, a bond reaches about ${K.dec((K.bond('EE', from, add(from, B.eeDoublingMonths - 1), 'electronic', 1000).value ?? 0) / 20, 0)} % of the doubled value by its own interest; the rest arrives in a single month. ${h.a('ee-bond-doubling', 'The doubling page')} has the step for every window since 2005.</p>
${h.mini('rate', { t: 'The rate of an EE bond you already own', p: ['iy', 'im'], d: { sr: 'EE', iy: 2024, im: 2 } })}

<h2>Buying: account, amounts and the yearly limit</h2>
<p>EE bonds are sold only in electronic form, through a TreasuryDirect account; banks no longer sell them, and paper EE bonds ended in 2012 (${h.src('td_eebonds', 'TreasuryDirect')}). The price is the amount you choose, from ${K.usd(B.electronicMin)} up, to the cent. There is no face value: an electronic bond is simply its price plus interest.</p>
<p>The issue date is the first day of the month in which TreasuryDirect receives the payment, so the timing within a month has two effects. A purchase whose payment reaches the Treasury before the end of ${K.month(to).split(' ')[0]} still gets the ${K.pct(cur)} rate and earns interest from ${on1(to)}; a payment received a few days later falls in the next window and takes whatever rate is announced on ${K.day(K.P.nextIBond.date)}. Once bought, the value of each bond appears in the account, and the calculator above gives the rate and the doubling date for any issue month since 1980.</p>
<p>Each Social Security number can buy up to ${K.usd(B.annualLimitElectronicEE)} of EE bonds per calendar year, the limit applying to the first person named on the bond (${h.src('td_limits', 'TreasuryDirect')}). Children with a minor account, trusts and businesses with an employer identification number each have their own. Gifts follow the person who receives them: a bond bought for someone else counts toward the recipient's limit in the year it is delivered, not the year it is bought (${h.src('td_gift', 'TreasuryDirect')}). I bonds have a separate ${K.usd(B.annualLimitElectronicI)} limit, and ${h.a('i-bond-limit', 'the I bond limit page')} explains how families stack both.</p>

<h2>The first five years of a bond bought now</h2>
<p>A new EE bond is locked for ${B.minHoldMonths} months. After that it can be cashed, but until its fifth anniversary the Treasury pays it without the last three months of interest. The table follows a ${K.usd(amt)} bond bought in ${K.month(from)}.</p>
${h.table(['Date', 'Age', 'Value if cashed', 'Interest given up'], lifeRows, `$1,000 electronic EE bond of ${K.month(from)} at ${K.pct(cur)}. The rate is fixed, so these values are known now.`, ['l', 'l', 'r', 'r'])}
<p>The penalty is small in dollars because three months of interest at ${K.pct(cur)} is small: ${K.usd2(y5m.penaltyCost)} at four years and eleven months. On ${on1(add(from, B.penaltyUntilMonths))} it disappears and the bond is worth ${v(y5)}. ${h.a('cash-savings-bonds', 'Cashing savings bonds')} explains how to redeem in TreasuryDirect, in full or in part, keeping at least ${K.usd(B.electronicMin)} in the bond.</p>
${h.mini('bond', { t: 'What an EE bond bought in 2023 is worth', p: ['amt'], d: { sr: 'EE', fm: 'electronic', im: 11, iy: 2023, amt: 2500 } })}

<h2>Twenty years, then thirty</h2>
<p>An EE bond earns interest for ${B.finalMaturityMonths / 12} years. Its 20th anniversary is the date that matters: on that day its value becomes at least twice its price, the Treasury paying any shortfall, which works out to ${K.pct(dbl)} a year. The bond in the calculator above, bought in May 2010 at ${K.pct(m10)}, reaches that point on ${on1(m10om)}. After the anniversary the bond keeps earning until year 30, when it is paid out automatically to the TreasuryDirect account.</p>
<p>That shape suits money that can sit for two decades, and suits it less for anything shorter. For a shorter horizon, an I bond or a Treasury bill follows market rates or inflation more closely; ${h.a('i-bonds-vs-ee-bonds', 'I bonds against EE bonds')} compares both series over the same period, and ${h.a('t-bill-rates', 'T-bill rates')} lists the latest auctions.</p>

<h2>Tax on EE bond interest</h2>
<p>EE bond interest is subject to federal income tax and exempt from state and local income tax. Most owners report it once, in the year the bond is cashed or reaches final maturity; others report the increase every year (${h.src('td_tax', 'TreasuryDirect')}). Interest on EE bonds used for tuition and fees can be excluded with Form 8815 within an income limit, provided the bond is in the parent's name and the owner was at least 24 before its issue date. ${h.a('savings-bonds-for-education', 'Savings bonds for education')} runs the numbers, and ${h.a('savings-bond-taxes', 'savings bond taxes')} covers the rest of the return. For bonds already in a drawer, ${h.a('ee-bond-value', 'EE bond value')} explains the older rules.</p>`,
  tool: 'rate',
  toolArg: { sr: 'EE', iy: 2010, im: 5 },
  related: ['ee-bond-doubling', 'ee-bond-value', 'i-bonds-vs-ee-bonds', 'i-bond-limit', 'savings-bonds-for-education', 'cash-savings-bonds'],
  sources: ['td_eebonds', 'td_ee2005', 'td_limits', 'td_gift', 'td_tax', 'cfr_351'],
});
