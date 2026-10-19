import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { PLANNED_STATES } from '../../lib/planned';

const b26 = K.bill('26-Week');
const y = b26.investment / 100;
// Reference household: single filer, $100,000 of taxable income.
const INC = 100000;
const f = K.fed(INC, 'single');
const all = K.STATE_SLUGS.map((slug) => {
  const s = K.S(slug), m = K.stateRate(slug, INC, 'single');
  return { slug, s, m: m.state, top: K.topRate(slug), eq: K.teq(y, f, m.state) };
});
const taxing = all.filter((x) => x.m > 0).sort((a, b) => b.eq - a.eq);
const hi = taxing[0], lo = taxing[taxing.length - 1];
const nyJ = K.stateRate('new-york', 120000, 'joint').state;
const nycJ = K.stateRate('new-york', 120000, 'joint', 'nyc').local;
const nNo = K.NO_TAX.length;
const noNames = K.NO_TAX.map((x) => K.S(x).name);
const older = all.filter((x) => x.s.year !== 2026 && x.s.hasIncomeTax);
// Median state rate at $100,000 among states that tax interest.
const med = taxing.map((x) => x.m).sort((a, b) => a - b)[Math.floor(taxing.length / 2)];
const topState = all.slice().sort((a, b) => b.top - a.top)[0];
const ca = all.find((x) => x.slug === 'california')!;
const caHi = K.stateRate('california', 1500000, 'single').state;
const caHiEq = K.teq(y, K.fed(1500000, 'single'), caHi);

export default defineGuide({
  id: 't-bill-state-tax',
  group: 'tbill',
  order: 60,
  slug: 't-bill-state-tax',
  nav: 'T-bill state tax',
  card: 'What the state tax exemption is worth in each state',
  title: 'T-Bill State Tax 2026: Exempt Yield in All 50 States, US',
  description: `T-bill state tax in 2026: Treasury interest is exempt in every state. The CD rate that matches a ${K.pct(y, 3)} bill, state by state, for ${K.usd(INC)} of income.`,
  h1: 'T-bill state tax: what the exemption is worth in each state',
  intro: `No state or city may tax interest on Treasury bills or savings bonds. How much that is worth depends on your state's rate: the table gives it for all fifty states and the District of Columbia.`,
  resume: `Treasury bill interest is exempt from state and local income tax in every state, under 31 U.S.C. 3124, and so is savings bond interest. You still report it on your federal return, and on most state returns you subtract it from income. The exemption is worth the state tax a fully taxable investment, such as a CD or a savings account, would pay on the same interest. For a single filer with ${K.usd(INC)} of taxable income, a 26-week bill at ${K.pct(y, 3)} is worth a CD rate of ${K.pct(hi.eq, 3)} in ${hi.s.name}, where the state marginal rate is ${K.pct(hi.m, 2)}, and ${K.pct(lo.eq, 3)} in ${lo.s.name}, at ${K.pct(lo.m, 2)}. In the ${nNo} states with no income tax on interest, ${noNames.join(', ')}, it is worth nothing. Each state's rate below comes from its tax agency's schedule, with the year shown. The calculator gives the figure for your own income, status and local tax.`,
  faqs: [
    { q: 'Are T-bills exempt from state tax in every state?', a: 'Yes. Federal law, 31 U.S.C. 3124, bars states and their political subdivisions from taxing interest on obligations of the United States, which covers bills, notes, bonds and savings bonds. The exemption is from income taxes; a state may still include the value of the bills in a franchise tax on corporations or in an estate tax.' },
    { q: 'How do I claim the T-bill state tax exemption?', a: 'You report the interest on the federal return, from Form 1099-INT, where the bill interest appears in box 3. On the state return, most states have a subtraction line for interest on U.S. obligations; a few start from a different income figure and simply leave it out. Each state page on this site names what its agency says.' },
    { q: 'Do T-bill funds get the same exemption?', a: 'Only partly, and it depends on the state. A mutual fund or ETF passes through dividends, not interest, and states decide whether the share earned from Treasury securities is exempt. Some require a minimum share of the fund in U.S. obligations. Bills held directly, in TreasuryDirect or at a broker, get the full exemption everywhere.' },
  ],
  body: (h) => {
    const has = new Set(PLANNED_STATES);
    const name = (x: typeof all[number]) => (has.has(x.slug) ? h.a(`state:${x.slug}`, x.s.name) : x.s.name);
    const rows = all.map((x) => [name(x), x.m > 0 ? K.pct(x.m, 2) : 'none', x.top > 0 ? K.pct(x.top, 2) : 'none', x.m > 0 ? `<strong>${K.pct(x.eq, 3)}</strong>` : K.pct(y, 3), String(x.s.year)]);
    return `
<h2>Fifty states and the District of Columbia</h2>
<p>The table applies each state's 2026 schedule, or the latest published one, to a single filer with ${K.usd(INC)} of taxable income, in a ${K.pct(f, 0)} federal bracket, and to the latest 26-week bill at ${K.pct(y, 3)}. The fourth column is the yield a CD or a savings account must pay to leave as much after federal and state tax. State names shown as links lead to a page that details that state's schedule and local taxes.</p>
${h.table(['State', 'Marginal rate at $100,000', 'Top rate', 'CD rate that matches the bill', 'Schedule year'], rows, `Single filer, ${K.usd(INC)} of taxable income, no local tax, no itemized deductions. State schedules from each state's tax agency; retrieved ${K.day(K.P.retrieved_at)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The median state rate at this income, among states that tax interest, is ${K.pct(med, 2)}. At that median, the exemption is worth ${K.dec((K.teq(y, f, med) - y) * 100, 3)} percentage point of extra CD yield. ${older.length ? `For ${older.map((x) => x.s.name).join(', ').replace(/, ([^,]+)$/, ' and $1')}, the 2026 schedule was not yet published when the site was built, so the table uses the ${older[0].s.year} one.` : ''}</p>
${h.mini('teq', { t: 'The figure for your own state', p: ['sx', 'inc', 'st'], d: { sx: 'new-york', inc: 120000, st: 'joint' } })}

<h2>Reading the result for a household</h2>
<p>Take a married couple in New York State, outside New York City, filing jointly with ${K.usd(120000)} of taxable income. Their federal rate is ${K.pct(K.fed(120000, 'joint'), 0)} and their state rate ${K.pct(nyJ, 2)}, so the 26-week bill at ${K.pct(y, 3)} is worth a CD rate of ${K.pct(K.teq(y, K.fed(120000, 'joint'), nyJ), 3)}. Living in the city adds ${K.pct(nycJ, 3)} of city tax, and the matching rate becomes ${K.pct(K.teq(y, K.fed(120000, 'joint'), nyJ + nycJ), 3)}. On ${K.usd(25000)} kept in bills for a year, the state and city tax avoided comes to about ${K.usd(25000 * y * (nyJ + nycJ))}. The calculator above starts from this case; change the state, the income and the status to get your own figure.</p>

<h2>Where it matters most</h2>
<p>The exemption is worth most where the marginal rate on interest is high, which depends on income as well as on the state. ${topState.s.name === 'California' ? 'California has the highest top rate in the country' : 'California has one of the highest top rates'} but a long middle bracket: at ${K.usd(INC)} the rate is ${K.pct(ca.m, 2)}, at ${K.usd(1500000)} it is ${K.pct(caHi, 2)} with the mental health services tax, and the matching CD rate rises to ${K.pct(caHiEq, 3)} even though the federal rate is also higher. New York City and the Portland area add local taxes on top of the state rate, and Maryland counties add between ${K.pct(K.S('maryland').localRange!.min, 2)} and ${K.pct(K.S('maryland').localRange!.max, 2)}. Those local taxes reach interest too, so the exemption covers them as well; the calculator has fields for them.</p>

<h2>The formula and its limits</h2>
<p>The matching CD rate is the bill yield × (1 − federal rate) ÷ (1 − federal rate − state rate). It assumes the extra interest falls in a single federal and state bracket and that you take the standard deduction. If you itemize and deduct state income tax below the cap on state and local tax deductions, part of the state tax comes back as lower federal tax and the formula becomes yield ÷ (1 − state rate). The calculator also ignores credits and phase-outs that some states apply, such as New York's recapture of its lower brackets at high incomes, which make the real marginal rate higher than the bracket rate for some incomes. The ${h.a('t-bill-vs-cd', 'T-bill versus CD page')} works through one household in detail.</p>

<h2>What the law covers</h2>
<p>Section 3124 of title 31 of the U.S. Code exempts stocks and obligations of the United States Government, and the interest on them, from taxation by a state or political subdivision of a state (${h.src('usc_3124', '31 U.S.C. 3124')}). It applies to Treasury bills, notes, bonds, TIPS and savings bonds. It does not cover obligations of agencies that are not the U.S. government itself, such as those of Fannie Mae or Freddie Mac; each state decides how to treat their interest under its own law. Interest on bank deposits, CDs and money market accounts is taxed by the state in the usual way.</p>

<h2>Savings bonds</h2>
<p>I bonds and EE bonds are covered by the same exemption. Their interest is usually reported in the year the bond is cashed, which can be decades after purchase, and the state subtraction applies in that year. The table works for them with their own rate in place of the bill yield: the ${h.a('i-bond-rates', 'I bond rates page')} has the current one. Federal tax on savings bonds, including the option to report interest each year, is on the ${h.a('savings-bond-taxes', 'savings bond tax page')}.</p>`;
  },
  tool: 'teq',
  toolArg: { sx: 'california', inc: 100000 },
  related: ['t-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'treasury-bills'],
  sources: ['usc_3124', 'fd_auctions', 'irs_rp_2025_32', 'irs_p550'],
});
