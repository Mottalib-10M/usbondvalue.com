import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'oregon';
const S = K.S(SL);
const b26 = K.bill('26-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
type St = 'single' | 'joint';
const go = (inc: number, st: St, pdx = '') => {
  const f = K.fed(inc, st), m = K.stateRate(SL, inc, st, pdx), sl = m.state + m.local;
  return { f, s: m.state, l: m.local, sl, eq: K.teq(y, f, sl), saved: 10000 * y * sl };
};
const INC = 140000;
const r = go(INC, 'single');
const sg = S.brackets.single, jt = S.brackets.joint;
const top = sg[sg.length - 1];
const L = Object.fromEntries((S.locals ?? []).map((l) => [l.id, l]));
const metro = L.metro.brackets!, mult = L.mult.brackets!, both = L.both.brackets!;
const nz = (b: Array<[number, number]>) => b.filter((x) => x[1] > 0);
const steps = (b: Array<[number, number]>) => nz(b).map(([lo, t]) => `${rp(t)} over ${K.usd(lo)}`).join(', then ');
const localRows = [
  ['Metro Supportive Housing Services', steps(metro.single), steps(metro.joint)],
  ['Multnomah County Preschool for All', steps(mult.single), steps(mult.joint)],
];
const maxBoth = both.single[both.single.length - 1][1];
const peak = top[1] + maxBoth;
const caTop = K.topRate('california');
const salem = go(INC, 'single');
const pdx = go(450000, 'joint', 'both');
const pdxNo = go(450000, 'joint');
const bal = 100000;
const stateRows = sg.map(([lo, t], i) => [`<strong>${rp(t)}</strong>`, K.usd(lo), K.usd(jt[i][0])]);

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: Oregon and Portland Taxes',
  description: `Oregon's ${rp(top[1])} rate starts at ${K.usd(top[0])} single, and Portland local taxes add up to ${rp(maxBoth)}. At ${K.usd(INC)} in 2026 a bank CD must pay ${K.pct(r.eq, 3)} to match a Treasury bill.`,
  intro: `Oregon reaches its top income tax rate at ${K.usd(top[0])} for a single filer, and two Portland-area taxes can stack on top of it; Treasury bill and savings bond interest is free of all three.`,
  resume: `A single Oregonian with ${K.usd(INC)} of taxable income is already in the top bracket: ${rp(r.s)} on every further dollar of bank interest, plus ${K.pct(r.f, 0)} federal. Interest on Treasury bills and U.S. savings bonds is exempt from Oregon tax. The 26-week bill auctioned on ${K.day(b26.auction)} yields ${K.pct(y, 3)}; to beat it after both taxes, a CD or savings account must pay more than ${K.pct(r.eq, 3)}. That makes each ${K.usd(10000)} kept in bills for a year worth ${K.usd2(r.saved)} of Oregon tax not paid. The brackets are the 2026 ones, taken from the Department of Revenue's withholding formula, and the ${K.usd(top[0])} start of the top rate is fixed in statute. Residents of the Metro district and of Multnomah County can owe the Supportive Housing Services tax and the Preschool for All tax as well; both are computed from Oregon taxable income, so Treasury interest escapes them too. Pick the local tax in the calculator to include it.`,
  body: (h) => `
<h2>Four brackets, and the last one starts early</h2>
<p>Oregon's schedule is short. The first three brackets are used up by the first ${K.usd(sg[2][0])} of a single filer's income, and the ${rp(sg[2][1])} rate then applies all the way to ${K.usd(top[0])}. From there it is ${rp(top[1])}. The top threshold is written into the statute and not indexed for inflation, so more savers cross it each year as wages grow.</p>
${h.table(['Rate', 'Single, from', 'Joint, from'], stateRows, `Oregon personal income tax brackets, tax year ${S.year} (Oregon withholding tax formulas, 150-206-436, effective January 1, 2026).`, ['l', 'r', 'r'])}
<p>Oregon also lets you subtract part of the federal income tax you paid, up to a cap. We leave it out because it depends on the whole return, so the state rate applied here can be slightly above the one you really pay.</p>

<h2>Metro and Multnomah County</h2>
<p>Two Portland-area taxes reach investment income. The Supportive Housing Services tax applies to people who live in the Metro district (and to those who work there, on their Metro income); the Preschool for All tax applies to residents of Multnomah County. Portland residents inside Multnomah County owe both. Each starts from Oregon taxable income, which means the federal interest you subtract on the state return never enters them.</p>
${h.table(['Local tax', 'Single', 'Joint'], localRows, 'Portland-area income taxes on residents, 2026 thresholds (City of Portland Revenue Division). The arts tax, a flat amount per person, is left out.', ['l', 'l', 'l'])}
<p>Added together, a Portland household above the last thresholds faces ${rp(peak)} of state and local tax on bank interest${peak > caTop ? `, more than the ${rp(caTop)} top rate of California` : ''}.</p>

<h2>Salem against Portland</h2>
<p>Take the single filer in Salem from the summary: ${rp(salem.s)} state, no local tax, a break-even CD rate of ${K.pct(salem.eq, 3)}. Now a married couple in Portland with ${K.usd(450000)} of joint taxable income. Oregon takes ${rp(pdx.s)}, the two local taxes ${rp(pdx.l)}, and the federal rate is ${K.pct(pdx.f, 0)}. Their CD must pay ${K.pct(pdx.eq, 3)}; without the local taxes it would be ${K.pct(pdxNo.eq, 3)}. On ${K.usd(10000)} at the bill yield the couple avoids ${K.usd2(pdx.saved)} a year.</p>
${h.mini('teq', { t: 'Portland local taxes and the Oregon break-even rate', p: ['pdx', 'inc'], d: { sx: SL, pdx: 'both', inc: 300000 } })}

<p>Scale it up to a balance of ${K.usd(bal)}, a common figure for a household parking the proceeds of a home sale. At the bill's yield, the interest for a year is ${K.usd(bal * y)}. In a Portland bank account above the local thresholds, Oregon and the two local taxes would take ${K.usd(bal * y * pdx.sl)} of it; in Treasury bills, nothing at the state or local level.</p>

<h2>Code 315 on Schedule OR-ASC</h2>
<p>The subtraction is claimed on Schedule OR-ASC with code 315, interest and dividends on U.S. bonds and notes, under ORS 316.680. Publication OR-17 names Treasury bill interest among the items that qualify. Savings bond interest, reported federally when you cash the bonds, is interest on a U.S. obligation too, exempt under the same federal law (31 U.S.C. 3124). For the general method behind these equivalents see ${h.a('t-bill-state-tax', 'state tax on T-bills')}; for the state to the south, ${h.a('state:california', 'California')}.</p>`,
  faqs: [
    { q: 'Do the Portland Metro and Multnomah County taxes apply to T-bill interest?', a: `No. Both the Supportive Housing Services tax and the Preschool for All tax are computed from Oregon taxable income, and interest on U.S. obligations is subtracted before that figure is reached. Bank CD interest is included, so a Portland resident above the thresholds pays up to ${rp(maxBoth)} on it in local tax alone.` },
    { q: 'At what income does the top Oregon rate start in 2026?', a: `At ${K.usd(top[0])} of taxable income for a single filer and ${K.usd(jt[jt.length - 1][0])} for a joint return, where the rate becomes ${rp(top[1])}. These thresholds are set in law and are not adjusted for inflation. Below them the rate is ${rp(sg[2][1])} across a very wide band.` },
    { q: 'Where do Oregon filers subtract Treasury interest?', a: 'On Schedule OR-ASC, the schedule of Oregon adjustments, under subtraction code 315 for interest and dividends on U.S. bonds and notes. Publication OR-17 names Treasury bill interest under that code. The interest stays in your federal adjusted gross income, which is where the Oregon return starts, and comes out there.' },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:california'],
  toolArg: { inc: INC },
});
