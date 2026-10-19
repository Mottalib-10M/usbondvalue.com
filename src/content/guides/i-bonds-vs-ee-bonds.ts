import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B = K.P.bonds;
const W = K.R.i.windows[K.R.i.windows.length - 1];
const iNow = K.composite(W.fixed, W.inflation);
const ee = K.R.eeCurrent;
const doubling = Math.pow(2, 1 / 20) - 1;
// Holding periods compared with the calculator (the I bond side keeps today's rate: a projection).
const holds = [5, 10, 17, 20, 25, 30].map((y) => {
  const r = K.tool('compare', { amt: 10000, yr: y });
  return [`${y} years`, r.rows[1][1], r.rows[3][1], r.value];
});
// Inflation needed for the I bond to match the EE doubling over 20 years (fixed part as today).
const breakEvenInfl = (() => { let lo = 0, hi = 0.1; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; (Math.pow(1 + K.composite(W.fixed, m) / 2, 40) < 2 ? (lo = m) : (hi = m)); } return lo; })();

export default defineGuide({
  id: 'i-bonds-vs-ee-bonds',
  group: 'ibond',
  order: 60,
  slug: 'i-bonds-vs-ee-bonds',
  nav: 'I bonds vs EE bonds',
  card: 'Inflation-linked rate or a value doubled at 20 years',
  title: 'I Bonds vs EE Bonds 2026: Rates, Doubling and Payoff, US',
  description: `I bonds vs EE bonds in 2026: ${K.pct(iNow)} indexed to inflation against ${K.pct(ee)} fixed with the value doubled at 20 years (${K.pct(doubling)} a year). Compare by holding time.`,
  h1: 'I bonds or EE bonds: which pays more for how long you hold',
  intro: `Bought from May to October 2026, an I bond earns ${K.pct(iNow)} that moves with inflation; an EE bond earns ${K.pct(ee)} fixed, but its value is doubled at 20 years. The answer turns on the holding period.`,
  resume: `The two savings bonds the Treasury sells share almost every rule: electronic only, ${K.usd(B.electronicMin)} to ${K.usd(B.annualLimitElectronicI)} per person per year for each series, no cashing for 12 months, three months of interest lost before five years, 30 years of interest, federal tax only. They differ in how they pay. An I bond bought now earns ${K.pct(iNow)}, a fixed ${K.pct(W.fixed)} plus inflation reset every six months, so its future return is unknown but tracks prices. An EE bond earns a fixed ${K.pct(ee)} for its whole life, and if that has not doubled its value at 20 years, the Treasury adds the difference once, which works out to ${K.pct(doubling)} a year for a bond held exactly 20 years. Cashed before 20 years, an EE bond at ${K.pct(ee)} trails an I bond at today's rate; held to 20 years it wins unless inflation averages more than about ${K.pct(2 * breakEvenInfl, 1)} a year. The table below runs both on ${K.usd(10000)}.`,
  faqs: [
    { q: 'Is an EE bond better than an I bond if I hold it 20 years?', a: `At 20 years an EE bond bought now is worth exactly twice its price, a return of ${K.pct(doubling)} a year. An I bond beats that only if its composite rate averages more over the 20 years, which with today's fixed rate of ${K.pct(W.fixed)} needs annual inflation of roughly ${K.pct(2 * breakEvenInfl, 1)} or more. Nobody knows future inflation, so the comparison is a break-even, not a prediction.` },
    { q: 'What happens to an EE bond cashed after 15 years?', a: `It gets only its fixed rate, ${K.pct(ee)} a year compounded every six months, with no doubling: the doubling step is paid only at the 20-year mark. That is why EE bonds make sense mostly for money set aside for 20 years or more, and why the comparison flips around that date.` },
    { q: 'Can I hold both I bonds and EE bonds in the same year?', a: `Yes. The limits are separate: ${K.usd(B.annualLimitElectronicI)} of electronic I bonds and ${K.usd(B.annualLimitElectronicEE)} of electronic EE bonds per Social Security number per calendar year, so one person can buy ${K.usd(B.annualLimitElectronicI + B.annualLimitElectronicEE)} in all. Both can be used for the education exclusion and both are exempt from state income tax.` },
  ],
  body: (h) => `
<h2>Ten thousand dollars, six holding periods</h2>
<p>The calculator and the table buy ${K.usd(10000)} of each series this month and cash them after the number of years shown. The EE column is exact to year 20: its rate is fixed and the doubling is a rule. The I column keeps today's composite rate of ${K.pct(iNow)} for every future period, which is a projection, not a forecast: the real rate will move with inflation every six months.</p>
${h.table(['Held', 'I bond (at today’s rate)', 'EE bond', 'Difference'], holds, `Electronic bonds of ${K.usd(10000)}, values on the Treasury's rules. Before five years both lose three months of interest.`, ['l', 'r', 'r', 'l'])}
<p>The pattern is the same whatever the inflation path: the EE bond lags until year 20, jumps to twice its price at year 20, then grows again at its fixed rate until year 30. The I bond grows smoothly, faster or slower depending on prices.</p>
${h.mini('compare', { t: 'Compare for your own holding period', p: ['yr'], d: { yr: 12 } })}

<h2>How each bond earns</h2>
<p>An EE bond issued since May 2005 keeps the fixed rate of its issue month (${h.src('td_ee2005', 'TreasuryDirect, EE bond rates')}). For bonds issued since June 2003 the Treasury promises that the value is at least twice the price 20 years after issue, and makes a one-time adjustment if the rate has not got there (${h.src('td_compare', 'TreasuryDirect, comparing EE and I bonds')}). At ${K.pct(ee)}, compounding alone would take a bond to ${K.dec(Math.pow(1 + ee / 2, 40), 2)} times its price in 20 years, so the adjustment supplies most of the gain. For the last ten years the Treasury says it may change the rate or the way the bond earns interest; until it announces anything, the calculator keeps the fixed rate on the doubled value.</p>

<h2>Years 20 to 30</h2>
<p>The EE rate is fixed for at least the first 20 years (${h.src('td_eebonds', 'TreasuryDirect, EE bonds')}). What happens after that is not settled for bonds sold since 2005: the Treasury reserves the right to set a different rate for the last decade. That is why the table's 25 and 30-year EE figures are marked with the same caution as the I bond projections. EE bonds from May 1997 to April 2005 show what an older regime looks like: their rate is reset every six months from Treasury yields, and is ${K.pct(K.R.ee1997[K.R.ee1997.length - 1][1])} for periods starting from May to October 2026. For an I bond nothing changes at year 20; it keeps its fixed rate and the inflation resets until year 30.</p>
<p>An I bond's rate is the fixed rate of its window plus twice the semiannual inflation rate, reset every six months from the issue month (${h.src('cfr_359', '31 CFR 359')}). It cannot fall below zero. The ${h.a('i-bond-rates', 'I bond rates page')} explains the formula and the ${h.a('next-i-bond-rate', 'next rate page')} what is already known about November.</p>

<h2>What is identical</h2>
<p>Both bonds are bought in TreasuryDirect from ${K.usd(B.electronicMin)} to the cent and dated the first of the purchase month. Neither can be cashed during the first 12 months; both lose three months of interest before five years; both stop earning at 30 years. Interest on both is reported to the IRS, by default in the year the bond is cashed or matures, and is exempt from state and local income tax. Both qualify for the ${h.a('savings-bonds-for-education', 'education exclusion')} when the owner is at least 24 and the income limits are met. The ${h.a('i-bond-limit', 'purchase limit')} is separate for each series.</p>

<h2>Where the choice usually falls</h2>
<p>The comparison is mostly about the holding period and about inflation risk. For money that may be needed within a few years, the EE bond's fixed rate of ${K.pct(ee)} is lower than the I bond's current composite and there is no doubling to wait for. For money that will stay put for 20 years, the EE bond turns into a known ${K.pct(doubling)} a year, and an I bond does better only if inflation is higher than the break-even of about ${K.pct(2 * breakEvenInfl, 1)} a year with today's fixed rate. An I bond holder is protected if prices rise faster; an EE holder knows the 20-year amount on the day of purchase. Those are the trade-offs; the decision depends on your own plans.</p>
<p>For bonds you already own, the value of each is on the ${h.a('ee-bond-value', 'EE bond value page')} and the home page calculator, and ${h.a('ee-bond-doubling', 'the EE doubling page')} gives the exact date your EE bond doubles.</p>`,
  tool: 'compare',
  related: ['ee-bond-doubling', 'i-bonds', 'ee-bonds', 'i-bond-rates', 'i-bond-limit'],
  sources: ['td_compare', 'td_ee2005', 'td_ibond_rates', 'cfr_351', 'cfr_359'],
});
