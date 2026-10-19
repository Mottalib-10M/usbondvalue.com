import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const D = K.P.tbills.termDays as Record<string, number>;
const b13 = K.bill('13-Week'), b52 = K.bill('52-Week'), b26 = K.bill('26-Week');
// Worked case: the latest 13-week discount rate on $10,000.
const w = K.billBuy(10000, b13.discount / 100, D['13-Week']);
// One discount rate across all terms: the yield grows with the term.
const dRef = Math.round(b13.discount * 4) / 4 / 100;
const termRows = K.TERMS.map((t) => { const x = K.billBuy(10000, dRef, D[t]); return [K.termLabel(t), String(D[t]), K.dec(x.pricePer100, 6), K.usd2(x.interest), K.pct(x.investmentRate, 3), K.pct(x.apy, 3)]; });
// A range of 13-week discount rates around the latest one.
const grid = [-0.5, -0.25, 0, 0.25, 0.5].map((k) => dRef + k / 100).filter((x) => x > 0);
const gridRows = grid.map((d) => { const x = K.billBuy(10000, d, D['13-Week']); return [K.pct(d, 3), K.dec(x.pricePer100, 6), K.usd2(x.cost), K.usd2(x.interest), K.pct(x.investmentRate, 3)]; });
// 52-week bill: simple formula against the Treasury's compounding formula.
const p52 = b52.price;
const simple52 = (100 - p52) / p52 * 365 / D['52-Week'];

export default defineGuide({
  id: 't-bill-calculator',
  group: 'tbill',
  order: 40,
  slug: 't-bill-calculator',
  nav: 'T-bill calculator',
  card: 'Price, interest and yield from any discount rate',
  title: 'T-Bill Calculator 2026: Price, Discount and Yield, US',
  description: `T-bill calculator for 2026: enter a discount rate and a term to get the price per ${K.usd(100)}, the interest and the investment rate, with the Treasury's own formulas.`,
  h1: 'T-bill calculator: price, interest and investment rate',
  intro: `Enter the discount rate of any Treasury bill, from an auction or a broker quote, and the term. The calculator gives the price, the interest in dollars and the yield to compare with a CD.`,
  resume: `A Treasury bill calculator turns a discount rate into what you pay and what you earn. The Treasury's formula is price per ${K.usd(100)} = 100 × (1 − discount rate × days ÷ 360), rounded to six decimals. With the latest 13-week discount rate of ${K.pct(b13.discount / 100, 3)} over ${D['13-Week']} days, the price is ${K.dec(w.pricePer100, 6)}, so ${K.usd(10000)} of face value costs ${K.usd2(w.cost)} and pays ${K.usd2(w.interest)} of interest at maturity. The investment rate, or bond-equivalent yield, divides that interest by the price and uses a 365-day year: ${K.pct(w.investmentRate, 3)}. That is the rate to set against a savings account or a CD. For bills longer than half a year, the Treasury uses a formula with semiannual compounding, which the calculator applies too. The calculator reproduces the investment rate published by the Treasury on ${K.num(K.P.checks.auctions)} bill auctions of 2023 and 2024. It does not include state tax, which bills do not pay: the state tax-equivalent page handles that part.`,
  faqs: [
    { q: 'How do I calculate the price of a T-bill from its discount rate?', a: `Multiply the discount rate by the number of days and divide by 360, subtract the result from 1 and multiply by 100. For ${D['13-Week']} days at ${K.pct(b13.discount / 100, 3)}, that gives ${K.dec(w.pricePer100, 6)} per ${K.usd(100)}. The Treasury rounds the price to six decimals, and the cost of a purchase is the face value times that price, divided by 100.` },
    { q: 'Why is the investment rate higher than the discount rate?', a: 'Two reasons. The discount rate divides the interest by the face value, which is larger than the price you pay, and it uses a 360-day year instead of 365. The investment rate corrects both, so it is always the higher of the two and is the one to compare with other yields.' },
    { q: 'How do I calculate the annual yield of rolling T-bills?', a: `If every bill is reinvested at the same price, the yearly yield is (100 ÷ price) raised to the power 365 ÷ days, minus 1. The calculator shows it as the yield if rolled for a year. In practice each auction sets a new rate, so the real result over a year will differ.` },
  ],
  body: (h) => `
<h2>The same discount rate on every term</h2>
<p>Bills of different terms quoted at the same discount rate do not yield the same. The table applies a discount rate of ${K.pct(dRef, 3)} to each term on ${K.usd(10000)}: the longer the bill, the further the price falls below face value, and the bigger the gap between the discount rate and the investment rate.</p>
${h.table(['Term', 'Days', 'Price per $100', 'Interest', 'Investment rate', 'Rolled for a year'], termRows, `${K.usd(10000)} of face value at a ${K.pct(dRef, 3)} discount rate. 365-day year.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The last column assumes each bill is replaced at maturity by an identical one at the same price for a full year. It shows why a 4-week bill and a 52-week bill with the same quoted rate are not the same deal: the short bill compounds more often if the rate holds, the long one locks the rate.</p>

<h2>Thirteen weeks around today's rate</h2>
<p>The next auction will not repeat the last one. The table below moves the 13-week discount rate a quarter point at a time around ${K.pct(dRef, 3)}, to show what a change of that size does to the price and to the interest on ${K.usd(10000)}.</p>
${h.table(['Discount rate', 'Price per $100', 'Cost', 'Interest', 'Investment rate'], gridRows, `${K.usd(10000)} of 13-week bills, ${D['13-Week']} days.`, ['r', 'r', 'r', 'r', 'r'])}
<p>A quarter point of discount on a 13-week bill moves the interest on ${K.usd(10000)} by about ${K.usd2(10000 * 0.0025 * D['13-Week'] / 360)}. On a 26-week bill the same move is worth twice as much, on a 4-week bill less than a third.</p>
${h.mini('tcalc', { t: 'Price from a discount rate', p: ['d', 'tm'], d: { d: Math.round(b26.discount * 1000) / 1000, tm: '26-Week', face: 10000 } })}

<h2>The formulas, step by step</h2>
<p>The Treasury publishes its methods on its pricing page (${h.src('td_pricing', 'TreasuryDirect, understanding pricing')}). Step one, the price: 100 × (1 − d × t ÷ 360), where d is the discount rate and t the days to maturity. Step two, the investment rate for a bill of up to half a year: (100 − price) ÷ price × y ÷ t, where y is 365, or 366 when a February 29 falls in the twelve months after the issue date. Step three, for a longer bill, the Treasury solves a quadratic equation that treats the bill as if it paid interest at six months, like a note. For the latest 52-week bill, priced at ${K.dec(p52, 6)}, the simple formula would give ${K.pct(simple52, 3)}; the Treasury's compounding formula gives ${K.pct(b52.investment / 100, 3)}, the figure published in the auction result.</p>
<p>The price is rounded to six decimals before the cost is computed, and the cost is rounded to the cent. Interest is the face value minus the cost. The calculator follows the same order, which is why its results match the auction results to the cent.</p>

<h2>Checked against the Treasury's own results</h2>
<p>The formulas are tested against every regular bill auction of 2023 and 2024 from the Fiscal Data auctions dataset (${h.src('fd_auctions', 'Fiscal Data')}), ${K.num(K.P.checks.auctions)} auctions in all, from 4-week to 52-week bills, including the leap year of 2024. For each one, the price computed from the published discount rate equals the published price, and the investment rate equals the published investment rate to the third decimal. Those tests run every time the site is built.</p>

<h2>Where the discount rate comes from</h2>
<p>For a purchase at auction, the discount rate is unknown until the auction closes, so a calculator can only show what a given rate would produce. The ${h.a('t-bill-rates', 'latest T-bill rates')} give a starting point, and the ${h.a('treasury-bill-rates', 'rate history')} shows how far rates moved over a year. On the secondary market, brokers quote bills by their discount rate or by their yield, and the calculator converts a discount quote into the yield. Broker fees, if any, are not included. A quote given as a yield rather than a discount rate can be checked by trying discount rates in the calculator until the investment rate matches.</p>

<h2>After tax</h2>
<p>The interest the calculator shows is taxed by the federal government in the year the bill matures and never by states or localities (${h.src('usc_3124', '31 U.S.C. 3124')}). Comparing a bill with a fully taxable CD therefore needs one more step, which the ${h.a('t-bill-vs-cd', 'T-bill versus CD page')} does for a given income and state, and the ${h.a('t-bill-state-tax', 'state tax page')} does for all fifty states and the District of Columbia. How bills are bought and held is on the ${h.a('treasury-bills', 'Treasury bills page')}.</p>`,
  tool: 'tcalc',
  related: ['t-bill-rates', 'treasury-bills', 't-bill-vs-cd', 'treasury-bill-rates'],
  sources: ['td_pricing', 'fd_auctions', 'td_tbills', 'usc_3124'],
});
