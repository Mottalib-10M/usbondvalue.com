import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B = K.P.bonds;
const W = K.R.i.windows[K.R.i.windows.length - 1];
const iNow = K.composite(W.fixed, W.inflation);
// Worked case: $10,000 electronic I bond bought in May 2023 (fixed 0.90 %), valued this month.
const ex = K.bond('I', '2023-05', K.BUILD, 'electronic', 10000);
const exFix = K.iFixed('2023-05');
const exPeriods = K.periods('I', '2023-05', K.BUILD);
// A $50 paper I bond of 2001 for the paper side.
const paper = K.bond('I', '2001-08', K.BUILD, 'paper', 50);
const fed22 = K.P.tax.brackets.single[2][1];

export default defineGuide({
  id: 'i-bonds',
  group: 'ibond',
  order: 20,
  slug: 'i-bonds',
  nav: 'I bonds explained',
  card: 'How Series I bonds earn, when you can cash them, how they are taxed',
  title: 'I Bonds 2026: How Series I Savings Bonds Work and Pay, US',
  description: `I bonds in 2026: ${K.pct(iNow)} through October, ${K.usd(B.annualLimitElectronicI)} a year per person, 12-month lockup and a 3-month penalty before 5 years. Check your own I bond's value.`,
  h1: 'I bonds: how a Series I savings bond earns and pays',
  intro: `A Series I savings bond is a U.S. Treasury bond for individuals whose rate follows consumer prices. New bonds earn ${K.pct(iNow)} until October 31, 2026; the rules below decide what yours pays.`,
  resume: `An I bond is an electronic savings bond sold by the Treasury in TreasuryDirect, from ${K.usd(B.electronicMin)} to ${K.usd(B.annualLimitElectronicI)} per person each calendar year, to the cent. It earns a composite rate made of a fixed rate, kept for 30 years, and an inflation rate reset every six months from the CPI-U; bonds bought from May to October 2026 earn ${K.pct(iNow)}, with a fixed rate of ${K.pct(W.fixed)}. Interest is added to the bond on the first of each month and compounds every six months. You cannot cash it during the first 12 months, and before five years you lose the last three months of interest. Interest is subject to federal income tax but not to state or local tax, and you can report it when you cash the bond. For example, ${K.usd(10000)} put into an I bond in May 2023 is worth ${ex.ok ? K.usd2(ex.value!) : 'n/a'} on the first of ${K.month(K.BUILD)}, after a penalty of ${K.usd2(ex.penaltyCost)} that disappears in ${K.month('2028-05')}.`,
  faqs: [
    { q: 'Can an I bond lose money?', a: 'No. The composite rate cannot fall below zero, so the value never goes down from one month to the next, and the amount the Treasury pays is never less than the price, even with the three-month penalty. What can happen is a six-month period with no interest, when deflation cancels the fixed rate.' },
    { q: 'How do I buy I bonds in 2026?', a: `Only electronically, in a TreasuryDirect account opened with a Social Security number, a U.S. address and a bank account. You choose an amount from ${K.usd(B.electronicMin)} up to ${K.usd(B.annualLimitElectronicI)} for the year; the money is debited from your bank and the bond is dated the first day of that month. Banks and brokers do not sell new I bonds.` },
    { q: 'Do I bonds pay interest monthly or every six months?', a: 'Both, in a sense. Interest is added to the value on the first day of each month, so a bond is worth a little more every month. The rate is applied to a new base every six months from the issue month, which is the compounding. Nothing is paid out to you until you cash the bond.' },
    { q: 'What happens to an I bond after 30 years?', a: 'It stops earning interest at final maturity, 30 years after the issue month. An electronic bond in TreasuryDirect is paid automatically to the linked bank account. A paper bond simply stops growing and should be cashed; the interest becomes taxable in the year it matures even if you do not cash it.' },
  ],
  body: (h) => `
<h2>Where the rate comes from</h2>
<p>The I bond rate is two numbers combined. The fixed rate is set by the Treasury for each six-month sales window and stays with the bond for 30 years. The inflation rate is computed from the consumer price index twice a year and applies to every I bond, each on its own six-month schedule. The ${h.a('i-bond-rates', 'I bond rates page')} shows the current figures and the rate of any bond; the ${h.a('i-bond-fixed-rate-history', 'fixed rate history')} lists every window since 1998.</p>
<p>The bond bought in May 2023 in the example above has a fixed rate of ${K.pct(exFix)}. It has been through ${exPeriods.length} rate periods so far, at ${exPeriods.map(([, r]) => K.pct(r)).join(', ')}. Each six-month period starts in May or November because the bond was issued in May.</p>
${h.mini('bond', { t: 'Value of an I bond you own', p: ['iy', 'amt'], d: { sr: 'I', fm: 'electronic', iy: 2022, im: 9, amt: 5000 } })}

<h2>Buying and holding</h2>
<p>New I bonds exist only as electronic bonds in TreasuryDirect, the Treasury's own website (${h.src('td_ibonds', 'TreasuryDirect, I bonds')}). You can buy any amount from ${K.usd(B.electronicMin)} to the cent, up to ${K.usd(B.annualLimitElectronicI)} per calendar year for each Social Security number; the ${h.a('i-bond-limit', 'purchase limit page')} explains how children, gifts and trusts add room. A bond can be registered to one owner, to two co-owners, or to an owner with a beneficiary. Every purchase is dated the first day of the month it is paid, and interest runs from that date.</p>
<p>Paper I bonds were sold at face value, at banks and through payroll plans until 2012 and with tax refunds until the end of 2024. They follow the same rates. A ${K.usd(50)} paper bond from August 2001, with its fixed rate of ${K.pct(K.iFixed('2001-08'))}, is worth ${paper.ok ? K.usd2(paper.value!) : 'n/a'} this month.</p>

<h2>Cashing an I bond</h2>
<p>For the first ${B.minHoldMonths} months the bond cannot be cashed at all, except in rare cases of a declared disaster. From month 13 to the fifth anniversary, the Treasury pays the value minus the last ${B.penaltyMonths} months of interest. After five years it pays the full value. An electronic bond can be cashed in part, for any amount of at least ${K.usd(B.electronicMin)} as long as ${K.usd(B.electronicMin)} remains; the money goes to the linked bank account in a few business days. A paper I bond has to be cashed whole, at a bank that offers the service or by mail to the Treasury. ${h.a('cash-i-bonds-early', 'The early cashing calculator')} prices the penalty in dollars, and ${h.a('cash-savings-bonds', 'the cashing page')} covers the paperwork.</p>

<h2>Tax on I bond interest</h2>
<p>Interest is taxed by the IRS as ordinary income and is exempt from state and local income tax (${h.src('usc_3124', '31 U.S.C. 3124')}). Most owners report it once, in the year the bond is cashed or reaches final maturity, using the Form 1099-INT the Treasury issues. You can instead report the increase in value every year. In the ${K.pct(fed22, 0)} federal bracket, ${K.usd(1000)} of I bond interest costs ${K.usd(1000 * fed22)} of federal tax and nothing at the state level. Interest used for college tuition can be excluded under the income limits of Form 8815: see ${h.a('savings-bonds-for-education', 'savings bonds for education')}. The ${h.a('savings-bond-taxes', 'tax page')} covers the methods in detail.</p>

<h2>What the fixed rate means over 30 years</h2>
<p>Because the inflation part only matches the rise in prices, the fixed rate is what an I bond earns above inflation. A bond with a fixed rate of ${K.pct(W.fixed)} grows by roughly that much a year in purchasing power, before federal tax, for as long as it is held, up to 30 years. A bond with a fixed rate of zero keeps its purchasing power and no more. The rate at which a bond was bought is therefore the main difference between two I bonds held for a long time, while the six-month inflation figures in the news matter mostly to someone holding for a year or two. Interest that is reported only when the bond is cashed also defers the federal tax for as long as the bond is kept.</p>

<h2>I bonds next to EE bonds and T-bills</h2>
<p>EE bonds, the other savings bond the Treasury sells, pay a fixed rate of ${K.pct(K.R.eeCurrent)} for bonds bought from May to October 2026 and double in value at 20 years; ${h.a('i-bonds-vs-ee-bonds', 'the comparison page')} runs both side by side. Treasury bills pay a market rate set at auction, mature in four to 52 weeks and have no penalty, but they reinvest at whatever the next auction pays. Their rates are on the ${h.a('t-bill-rates', 'T-bill rates page')}.</p>`,
  tool: 'bond',
  toolArg: { sr: 'I', fm: 'electronic', iy: 2023, im: 5, amt: 10000 },
  related: ['i-bond-rates', 'i-bond-limit', 'cash-i-bonds-early', 'i-bonds-vs-ee-bonds', 'savings-bond-taxes'],
  sources: ['td_ibonds', 'td_ibond_rates', 'cfr_359', 'td_limits', 'td_tax'],
});
