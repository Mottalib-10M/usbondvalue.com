import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B = K.P.bonds;
const W = K.R.i.windows[K.R.i.windows.length - 1];
const iNow = K.composite(W.fixed, W.inflation);
// Five electronic I bonds of $10,000, bought at different dates, cashed this month.
const cases = ['2022-01', '2022-11', '2023-05', '2024-11', '2025-11'].map((m) => ({ m, r: K.bond('I', m, K.BUILD, 'electronic', 10000) }));
const shift = (m: string, k: number) => { const [y, mo] = m.split('-').map(Number); const n = y * 12 + mo - 1 + k; return `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`; };
const rows = cases.map(({ m, r }) => [K.month(m), r.ok ? (r.cashable ? K.usd2(r.value!) : 'not yet') : 'n/a', r.ok && r.cashable ? K.usd2(r.penaltyCost) : '', r.ok ? K.month(shift(m, B.penaltyUntilMonths)) : '']);
const ex = cases[2].r;
// A partial redemption: $3,000 out of the 2023 bond.
const part = 3000;

export default defineGuide({
  id: 'cash-i-bonds-early',
  group: 'ibond',
  order: 50,
  slug: 'cash-i-bonds-early',
  nav: 'Cashing I bonds early',
  card: 'What the three-month penalty costs in dollars, and when it ends',
  title: 'Cash I Bonds Early 2026: The 3-Month Penalty in Dollars, US',
  description: `Cashing I bonds early in 2026: locked for 12 months, then the last 3 months of interest are lost until year 5. See the dollar penalty and when it ends.`,
  h1: 'Cashing I bonds before five years: what the penalty costs',
  intro: `An I bond cannot be cashed in its first ${B.minHoldMonths} months. After that and until its fifth anniversary, the Treasury keeps the last ${B.penaltyMonths} months of interest. The calculator puts a dollar figure on it for your bond.`,
  resume: `The early redemption penalty on an I bond is the interest of the last three months before you cash it. It applies from the 13th month to the end of the fifth year; before 12 months the bond cannot be cashed at all, and after five years there is no penalty. The amount depends on the bond's current rate and size. A ${K.usd(10000)} electronic I bond bought in May 2023 is worth ${ex.ok ? K.usd2(ex.value!) : 'n/a'} if cashed in ${K.month(K.BUILD)}; the penalty already deducted is ${K.usd2(ex.penaltyCost)}, about three months at ${ex.rate === undefined ? 'n/a' : K.pct(ex.rate)} a year, and it stops applying in ${K.month(shift('2023-05', B.penaltyUntilMonths))}. The penalty never takes the value below what you paid. Electronic bonds can be cashed in part, so a holder can take out what is needed and leave the rest, as long as at least ${K.usd(B.electronicMin)} remains. Interest received is reported for federal tax in the year you cash.`,
  faqs: [
    { q: 'How is the I bond early withdrawal penalty calculated?', a: 'The Treasury pays the value the bond had three months earlier. If you cash in October, you receive the July value, so the interest of August, September and October is lost. Because rates change every six months, those three months may fall in two different rate periods. The value paid is never below the purchase price.' },
    { q: 'Can I cash part of an I bond before five years?', a: `Yes, for electronic bonds held in TreasuryDirect. You choose any amount of at least ${K.usd(B.electronicMin)}, and the bond must keep at least ${K.usd(B.electronicMin)}. The penalty applies in proportion to the amount cashed, and the part you keep goes on earning. Paper I bonds can only be cashed whole.` },
    { q: 'Is there any way to cash an I bond in the first 12 months?', a: 'Only in the narrow cases the Treasury lists, such as owners in an area hit by a declared natural disaster, under its disaster rules. Otherwise the money is locked for a full year from the issue month, and TreasuryDirect will not show a redemption option before then.' },
    { q: 'Does the penalty change the tax I owe?', a: 'You pay federal tax only on the interest you actually receive, so the three months forfeited are never taxed. The interest is reported for the year you cash, on the Form 1099-INT the Treasury issues, and remains exempt from state and local income tax.' },
  ],
  body: (h) => `
<h2>Five bonds cashed this month</h2>
<p>The table cashes five ${K.usd(10000)} electronic I bonds bought at different dates, on the first of ${K.month(K.BUILD)}. The penalty column is the interest the Treasury keeps; the last column is the month when the penalty no longer applies. A bond that is not yet 12 months old shows no value because it cannot be cashed.</p>
${h.table(['Bought', 'Paid if cashed now', 'Penalty', 'No penalty from'], rows, `Electronic I bonds of ${K.usd(10000)}, values from the Treasury's rules (31 CFR 359).`, ['l', 'r', 'r', 'l'])}
<p>The penalty is small next to the interest a bond from 2022 has earned at the high rates of that year, and larger, relative to interest, on a recent bond. It is always three months of whatever rate the bond is earning now, not three months of the rate it earned when it was bought.</p>
${h.mini('icash', { t: 'Penalty on your own I bond', p: ['iy', 'amt'], d: { iy: 2022, im: 4, amt: 7500 } })}

<h2>The rules in the regulation</h2>
<p>Under 31 CFR 359 an I bond may be redeemed at any time after 12 months from its issue date. A bond redeemed less than five years after issue is paid with a reduction of three months of interest (${h.src('cfr_359', '31 CFR 359')}). TreasuryDirect describes the same rule on its I bond page: you can cash the bond after one year, but if you cash it before five years you lose the last three months of interest (${h.src('td_ibonds', 'TreasuryDirect, I bonds')}). The issue date is the first day of the purchase month, so a bond bought on May 28, 2023 counts as a May 1, 2023 bond: cashable from May 1, 2024, and free of the penalty from May 1, 2028.</p>
<p>Interest is credited on the first day of each month, which matters for the timing of a redemption. Cashing on the last day of a month gives nothing for that month; waiting until the 1st adds a month of interest. Near the fifth anniversary, waiting a few days can remove the penalty altogether.</p>

<h2>Cashing part of a bond</h2>
<p>An electronic bond in TreasuryDirect can be redeemed in part. Taking ${K.usd(part)} out of the ${K.usd(10000)} bond from May 2023 cashes ${K.pct(part / 10000, 0)} of it, with the same share of the penalty, and the remaining ${K.usd(10000 - part)} of principal keeps earning with its original fixed rate and dates. The amount left must be at least ${K.usd(B.electronicMin)}. Paper bonds do not allow it: a paper I bond is cashed whole at a bank or by mail, or first converted into an electronic bond, which can then be cashed in part. The ${h.a('cash-savings-bonds', 'cashing page')} covers the steps.</p>

<h2>Disasters and other exceptions</h2>
<p>The 12-month lock has one published exception. Owners living in an area with an official disaster declaration can cash savings bonds even when they are less than a year old, and even when paper bonds are lost or damaged, under the Treasury's disaster procedures (${h.ext('https://www.treasurydirect.gov/savings-bonds/cashing-a-bond/affected-by-a-disaster/', 'TreasuryDirect, affected by a disaster')}). The three-month penalty before five years still applies to those redemptions. For a bond that passes to someone at the owner's death, the ${h.a('inherited-savings-bonds', 'inherited bonds page')} explains who may cash it.</p>

<h2>Where the penalty shows up</h2>
<p>The penalty is not a separate charge on a statement. TreasuryDirect simply displays and pays the reduced value, and the Form 1099-INT reports the interest actually paid, net of the three forfeited months. Someone who compares the current value in the account with a value computed from the rate alone will see the difference and may think the bond is underpaid. The calculator separates the two figures for that reason, and shows the month from which the full value is paid.</p>

<h2>Penalty against a new rate</h2>
<p>Some holders cash an older bond to buy a new one when the new composite rate is higher. The arithmetic has three parts: the penalty in dollars, the difference in rate over the time you plan to hold, and the purchase limit of ${K.usd(B.annualLimitElectronicI)} a year, which caps what can be bought back. New bonds bought from May to October 2026 earn ${K.pct(iNow)} with a fixed rate of ${K.pct(W.fixed)}; your bond's own rate is on the ${h.a('i-bond-rates', 'I bond rates page')}, and the fixed rate of its window in the ${h.a('i-bond-fixed-rate-history', 'fixed rate history')}. A new bond also restarts the 12-month lock and the five-year penalty clock.</p>
<p>Tax is the fourth part. Cashing brings the deferred interest into the current year's federal return; a bond kept until a lower-income year, or used for tuition under ${h.a('savings-bonds-for-education', 'the education exclusion')}, may cost less tax. The ${h.a('savings-bond-taxes', 'tax page')} gives the rules.</p>`,
  tool: 'icash',
  toolArg: { iy: 2023, im: 5 },
  related: ['i-bonds', 'i-bond-rates', 'cash-savings-bonds', 'savings-bond-taxes'],
  sources: ['cfr_359', 'td_ibonds', 'td_cashing', 'td_tax'],
});
