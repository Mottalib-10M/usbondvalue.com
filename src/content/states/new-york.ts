import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'new-york';
const S = K.S(SL);
const b26 = K.bill('26-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const calc = (inc: number, st: 'single' | 'joint', city: boolean) => {
  const f = K.fed(inc, st), m = K.stateRate(SL, inc, st, city ? 'nyc' : '');
  const sl = m.state + m.local;
  return { f, s: m.state, c: m.local, sl, eq: K.teq(y, f, sl), saved: 10000 * y * sl };
};
const INC = 180000;
const nyc = calc(INC, 'single', true);
const nyc0 = calc(INC, 'single', false);
const NYC = S.locals!.find((l) => l.id === 'nyc')!.brackets!;
const sg = S.brackets.single, jt = S.brackets.joint;
const stateRows = sg.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), K.usd(jt[i][0])]);
const cityRows = NYC.single.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), K.usd(NYC.joint[i][0])]);
const cityTop = NYC.single[NYC.single.length - 1];
// Thresholds and the Yonkers share, read from the state row (no figure typed here).
const recapture = Number((S.surtax ?? '').match(/\$([\d,]+)/)?.[1].replace(/,/g, '') ?? 0);
const yonkers = Number((S.local ?? '').match(/([\d.]+)% of net NY State tax/)?.[1] ?? 0) / 100;
const upstate = calc(90000, 'single', false);
const brooklyn = calc(400000, 'joint', true);
const topState = sg[sg.length - 1];

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: New York State and NYC Tax',
  description: `A New York City resident at ${K.usd(INC)} pays ${rp(nyc.sl)} in state and city tax on CD interest, none on T-bills or bonds. The 2026 break-even CD rate is ${K.pct(nyc.eq, 3)}.`,
  intro: 'New York has two taxes that a Treasury bill sidesteps for city residents: the state income tax and the New York City personal income tax, both of which start from the state return.',
  resume: `For a single filer living in one of the five boroughs with ${K.usd(INC)} of taxable income, the next dollar of bank interest is taxed at ${rp(nyc.s)} by Albany and ${rp(nyc.c)} by the city, ${rp(nyc.sl)} in all, before the ${K.pct(nyc.f, 0)} federal rate. Interest from Treasury bills and savings bonds pays neither of those two taxes. The latest 26-week bill, auctioned on ${K.day(b26.auction)}, yields ${K.pct(y, 3)}; a CD would need ${K.pct(nyc.eq, 3)} to leave the same amount after tax. Outside the city, with the same income, the equivalent drops to ${K.pct(nyc0.eq, 3)} because only the state rate applies. On ${K.usd(10000)} held for a year at the bill's yield, a city resident avoids ${K.usd2(nyc.saved)} of state and city tax, and someone upstate ${K.usd2(nyc0.saved)}. The figures use the 2026 New York rate schedule, which already includes the rate cuts on the five lowest brackets voted in 2025, and the 2026 New York City schedule.`,
  body: (h) => `
<h2>The state schedule for 2026</h2>
<p>New York lowered the rates of its first five brackets for 2026 under Chapter 59 of the Laws of 2025, and the Department of Taxation and Finance printed the new schedule in its estimated tax instructions (IT-2105-I). Nine brackets remain. The rates above the middle are unchanged, and the top one, ${rp(topState[1])}, starts at ${K.usd(topState[0])}${jt[jt.length - 1][0] === topState[0] ? ' for single and joint filers alike' : ''}.</p>
${h.table(['Rate', 'Single, from', 'Married filing jointly, from'], stateRows, `New York State income tax brackets, tax year ${S.year} (IT-2105-I).`, ['l', 'r', 'r'])}

<h2>The city layer, and why it matters for cash</h2>
<p>New York City residents pay a second income tax computed on city taxable income. Its base is built from the state return, so the federal interest that leaves the state return leaves the city one too. The city schedule is flat in practice: once taxable income passes ${K.usd(cityTop[0])} (single) the rate is ${rp(cityTop[1])} on everything above. For a cash-heavy household in Manhattan or Queens, that city rate lands on every extra dollar of CD interest on top of the state rate, and none of it on a T-bill.</p>
${h.table(['City rate', 'Single, from', 'Married filing jointly, from'], cityRows, `New York City resident income tax, ${S.year}. The school tax credit, a small rate reduction for incomes up to a limit, is left out.`, ['l', 'r', 'r'])}

<h2>Yonkers and the rest of the state</h2>
<p>Yonkers residents pay a surcharge of ${rp(yonkers)} of their net state tax, so it shrinks with the state tax and Treasury interest escapes it as well. Anywhere else in the state, the calculator above applies the state schedule alone, which is what the upstate example below shows.</p>

<h2>A Buffalo saver and a Brooklyn couple</h2>
<p>A single retiree in Buffalo with ${K.usd(90000)} of taxable income pays ${rp(upstate.s)} to the state and ${K.pct(upstate.f, 0)} federally. Her CD has to pay ${K.pct(upstate.eq, 3)} to match the bill, and ${K.usd(10000)} in T-bills saves her ${K.usd2(upstate.saved)} a year. A married couple in Brooklyn reporting ${K.usd(400000)} jointly faces ${rp(brooklyn.s)} from the state plus ${rp(brooklyn.c)} from the city. Their break-even CD rate is ${K.pct(brooklyn.eq, 3)}, and the same ${K.usd(10000)} saves ${K.usd2(brooklyn.saved)}. Switch the city answer off in the mini calculator to see how much of the advantage comes from living in the five boroughs.</p>
${h.mini('teq', { t: 'Upstate or in the city: New York break-even rate', p: ['nyc', 'inc'], d: { sx: SL, nyc: 'no', inc: 90000 } })}

<h2>When the true rate is higher: the recapture worksheets</h2>
<p>New York takes back the benefit of its lower brackets once New York adjusted gross income passes ${K.usd(recapture)}. During that phase-in the tax on one more dollar is higher than the rate printed in the bracket table. Our calculator uses the bracket rate, so in that zone it understates what a CD costs you, and a T-bill's advantage is larger than shown.</p>

<h2>Line 28 of Form IT-201</h2>
<p>Federal adjusted gross income includes your T-bill and savings bond interest. On the resident return, Form IT-201, it comes back out on line 28, interest income on U.S. government bonds, and the city and Yonkers computations follow from there. For the federal side of the same interest, read ${h.a('savings-bond-taxes', 'how savings bond interest is taxed')}, and for the neighbor across the Hudson, ${h.a('state:new-jersey', 'the New Jersey page')}.</p>`,
  faqs: [
    { q: 'Do New York City residents pay city tax on T-bill interest?', a: `No. The New York City personal income tax is computed from the state return, and interest on U.S. Treasury obligations is subtracted there, so it never reaches the city base. Interest from a bank CD or savings account is taxed by both: up to ${rp(topState[1])} by the state and ${rp(cityTop[1])} by the city at most incomes above ${K.usd(cityTop[0])}.` },
    { q: 'Which line of the New York return removes Treasury interest?', a: 'Line 28 of Form IT-201, interest income on U.S. government bonds, according to the 2025 instructions. You enter the T-bill and savings bond interest that is in your federal adjusted gross income. The New York City and Yonkers taxes then start from a state figure that already leaves it out, so nothing more is needed for them.' },
    { q: 'Did New York cut its income tax rates for 2026?', a: `Yes, for the first five brackets. The 2026 schedule lowers each of them slightly and leaves the higher rates as they were, so savers whose taxable income is above ${K.usd(sg[5][0])} (single) see no change in the rate on their last dollar of interest. The figures on this page use the 2026 schedule.` },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:new-jersey'],
  toolArg: { inc: INC, nyc: 'yes' },
});
