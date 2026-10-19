import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const b26 = K.bill('26-Week'), b52 = K.bill('52-Week'), b13 = K.bill('13-Week');
const y = b26.investment / 100;
// Worked household: single filer, $150,000 of taxable income.
const INC = 150000;
const f = K.fed(INC, 'single');
const row = (slug: string, inc = INC, st: 'single' | 'joint' = 'single') => {
  const s = K.S(slug), m = K.stateRate(slug, inc, st), eq = K.teq(y, K.fed(inc, st), m.state);
  return { s, m, eq };
};
const SHOW = ['new-jersey', 'california', 'new-york', 'oregon', 'massachusetts', 'illinois', 'pennsylvania', 'texas'].filter((x) => K.STATE_SLUGS.includes(x));
const rows = SHOW.map((slug) => { const r = row(slug); return [r.s.name, K.pct(r.m.state, 2), `<strong>${K.pct(r.eq, 3)}</strong>`, K.pct(r.eq - y, 3)]; });
const nj = row('new-jersey');
const njJoint = row('new-jersey', 300000, 'joint');
// What the difference is worth in dollars on $50,000 for six months.
const amt = 50000;
const njGain = amt * y * nj.m.state * (182 / 365);
// CD yields are quoted as APY: the 26-week investment rate converted to a yearly compounded figure.
const apy26 = Math.pow(1 + y * 182 / 365, 365 / 182) - 1;

export default defineGuide({
  id: 't-bill-vs-cd',
  group: 'tbill',
  order: 50,
  slug: 't-bill-vs-cd',
  nav: 'T-bill vs CD',
  card: 'The CD rate that matches a T-bill after state tax',
  title: 'T-Bill vs CD 2026: After-Tax Yield by State and Income, US',
  description: `T-bill vs CD in 2026: a ${K.pct(y, 3)} 26-week bill is worth ${K.pct(nj.eq, 3)} from a CD for a single New Jersey filer at ${K.usd(INC)}. See the CD rate needed in your own state.`,
  h1: 'T-bill or CD: which pays more after state tax',
  intro: `A CD's interest is taxed by your state, a T-bill's is not. The calculator gives the CD rate that would leave you as much as a bill after tax, for your state, income and filing status.`,
  resume: `To compare a Treasury bill with a CD, put both on an after-tax basis. Both pay interest taxed by the federal government, but only the CD pays state and local income tax: Treasury interest is exempt under 31 U.S.C. 3124. The CD rate that matches a bill is the bill yield × (1 − federal rate) ÷ (1 − federal rate − state rate). For a single filer in New Jersey with ${K.usd(INC)} of taxable income, the federal marginal rate is ${K.pct(f, 0)} and the state rate ${K.pct(nj.m.state, 2)}, so the latest 26-week bill at ${K.pct(y, 3)} is worth a CD paying ${K.pct(nj.eq, 3)}. In Texas, which has no income tax, the two rates are compared directly. Two more points change the answer: a CD quotes an APY, compounded, while a bill quotes a simple annual rate, and a CD may be closed early only with the bank's penalty, while a bill can be sold at the market price. The calculator handles the tax part for any state.`,
  faqs: [
    { q: 'Is a T-bill better than a CD?', a: `It depends on the two rates, the term and your state. A bill pays no state or local income tax, which adds ${K.pct(nj.eq - y, 3)} to its yield for a single filer in New Jersey at ${K.usd(INC)} and nothing in a state without income tax. A CD with a rate above the tax-equivalent figure pays more after tax; below it, the bill does.` },
    { q: 'How do I compare a CD APY with a T-bill yield?', a: `A CD's APY includes compounding over a year; a bill's investment rate is a simple annual rate for its term. To compare a 26-week bill at ${K.pct(y, 3)} with a one-year CD, compound it twice: about ${K.pct(apy26, 3)} if a second bill paid the same rate. Then apply the state tax adjustment.` },
    { q: 'Does it matter if I itemize deductions?', a: 'Slightly. If you deduct state income tax on Schedule A and stay under the cap on state and local tax deductions, each dollar of state tax on CD interest saves federal tax, which narrows the gap. The calculator has an option for it in the advanced fields. Most households take the standard deduction, where the option does not apply.' },
  ],
  body: (h) => `
<h2>The same bill in eight states</h2>
<p>The table takes the latest 26-week bill, at ${K.pct(y, 3)}, and a single filer with ${K.usd(INC)} of taxable income, in a ${K.pct(f, 0)} federal bracket. The last column is how much higher a CD must pay to match the bill after tax.</p>
${h.table(['State', 'State marginal rate', 'CD rate that matches the bill', 'Extra the CD needs'], rows, `Single filer, ${K.usd(INC)} of taxable income, 2026 federal brackets, state schedules from each state's tax agency. No local income tax counted.`, ['l', 'r', 'r', 'r'])}
<p>The gap grows with the state rate and with the bill yield. It shrinks as the federal rate rises, because a higher federal rate makes every dollar of state tax a smaller share of what is left. For a married couple in New Jersey with ${K.usd(300000)} of taxable income, the state rate is ${K.pct(njJoint.m.state, 2)} and the matching CD rate ${K.pct(njJoint.eq, 3)}.</p>
${h.mini('teq', { t: 'The matching CD rate for your state', p: ['sx', 'inc'], d: { sx: 'california', inc: 90000 } })}

<h2>The formula</h2>
<p>A bill yield y loses only federal tax f: what is left is y × (1 − f). A CD rate r loses federal and state tax s: r × (1 − f − s). Setting the two equal gives r = y × (1 − f) ÷ (1 − f − s). With a New Jersey state rate of ${K.pct(nj.m.state, 2)} and a ${K.pct(f, 0)} federal rate, r = ${K.pct(y, 3)} × ${K.dec(1 - f, 2)} ÷ ${K.dec(1 - f - nj.m.state, 4)} = ${K.pct(nj.eq, 3)}. On ${K.usd(amt)} held for 26 weeks, the state tax the bill avoids is about ${K.usd2(njGain)}. If you itemize and deduct state tax below the cap, the formula becomes r = y ÷ (1 − s), because the state tax itself reduces federal tax. Where a city or county also taxes interest, add its rate to s; the calculator has fields for New York City, the Portland area and other local taxes.</p>

<h2>APY, investment rate and term</h2>
<p>A bank quotes a CD with its annual percentage yield, which assumes the interest compounds for a year. A bill's investment rate is a simple annual rate for its term: a 26-week bill earns about half of it, paid at maturity. To compare a 26-week bill with a one-year CD, the bill's rate has to be compounded over two terms, which turns ${K.pct(y, 3)} into about ${K.pct(apy26, 3)}, on the assumption that the second bill pays the same rate. It may not: the next auction sets a new rate. A 52-week bill, at ${K.pct(b52.investment / 100, 3)} at its latest auction, locks the rate for a year like a one-year CD, and the Treasury computes its investment rate with semiannual compounding already built in.</p>
<p>Terms should match as well. A 13-week bill at ${K.pct(b13.investment / 100, 3)} compared with a five-year CD says little: the CD fixes a rate for five years, the bill for three months.</p>

<h2>Getting the money out early</h2>
<p>A CD closed before its term usually costs a penalty set by the bank, often a number of months of interest. A bill has no penalty, but in TreasuryDirect it cannot be sold: it must first be moved to a bank or broker, which sells it at the market price of the day. If rates have risen since you bought, that price can be a little below what the bill would be worth at maturity; if they have fallen, a little above. For short bills held at a broker the difference is usually small. Money that may be needed before maturity fits better in a short bill or in a CD with a light penalty.</p>

<h2>Safety and access</h2>
<p>A bill is a direct obligation of the United States. A CD at an insured bank is covered by federal deposit insurance up to the limits that apply to your accounts at that bank. Both can be held in a brokerage account; bills can also be bought directly in TreasuryDirect from ${K.usd(K.P.tbills.minimum)} (${h.src('td_tbills', 'TreasuryDirect, Treasury bills')}). Rates are on the ${h.a('t-bill-rates', 'T-bill rates page')}, and the ${h.a('t-bill-state-tax', 'state tax page')} gives the matching CD rate for every state at once.</p>

<h2>Savings bonds in the same comparison</h2>
<p>I bonds and EE bonds share the bill's exemption from state and local tax (${h.src('usc_3124', '31 U.S.C. 3124')}), so the same formula converts their rate into a CD rate. Their other rules differ: a savings bond cannot be cashed in its first year, loses three months of interest before five years, and lets you put off federal tax until you cash it. The ${h.a('i-bonds', 'I bonds page')} and the ${h.a('savings-bond-taxes', 'savings bond tax page')} cover those rules.</p>`,
  tool: 'teq',
  toolArg: { sx: 'new-jersey', inc: 150000 },
  related: ['t-bill-state-tax', 't-bill-rates', 'treasury-bills', 't-bill-calculator'],
  sources: ['usc_3124', 'fd_auctions', 'td_tbills', 'irs_rp_2025_32'],
});
