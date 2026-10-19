import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'hawaii';
const S = K.S(SL);
const b26 = K.bill('26-Week'), b4 = K.bill('4-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const hi = (inc: number, st: 'single' | 'joint', yy = y) => {
  const f = K.fed(inc, st), s = K.stateRate(SL, inc, st).state;
  return { f, s, eq: K.teq(yy, f, s), saved: 10000 * yy * s };
};
const INC = 120000;
const m = hi(INC, 'single');
const sg = S.brackets.single, jt = S.brackets.joint;
const top = sg[sg.length - 1];
const nb = sg.length;
const mostBrackets = K.STATE_SLUGS.every((x) => x === SL || K.S(x).brackets.single.length < nb);
const higherTop = K.STATE_SLUGS.filter((x) => K.topRate(x) > top[1]).map((x) => K.S(x).name);
const ORD = ['', 'second', 'third', 'fourth'];
const midRate = sg.find((x) => x[0] <= INC && sg[sg.indexOf(x) + 1]?.[0] > INC)!;
const doubled = jt.every((x, i) => x[0] === 2 * sg[i][0] && x[1] === sg[i][1]);
const rows = sg.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), K.usd(jt[i][0])]);
const hilo = hi(50000, 'single'), hilo4 = hi(50000, 'single', b4.investment / 100);
const hnl = hi(700000, 'joint');
const r76 = sg[6][1];
const lowerTop = K.STATE_SLUGS.filter((x) => K.topRate(x) > 0 && K.topRate(x) < r76).length;
const savers = hi(sg[6][0], 'single');

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: Hawaii State Income Tax',
  description: `Hawaii taxes bank interest at ${rp(m.s)} for a single filer at ${K.usd(INC)} in 2026 and up to ${rp(top[1])} at the top. T-bills pay none of it, so a bank CD needs ${K.pct(m.eq, 3)}.`,
  intro: `Hawaii spreads its income tax over ${nb} brackets and reaches ${rp(midRate[1])} at middle incomes, so the state exemption on Treasury bills and savings bonds matters to ordinary savers, not only to the rich.`,
  resume: `On ${K.usd(INC)} of taxable income, a single Hawaii resident pays ${rp(m.s)} to the state on the next dollar of interest from a bank and ${K.pct(m.f, 0)} to the IRS. Interest on Treasury bills and U.S. savings bonds is outside Hawaii income tax. The 26-week bill auctioned on ${K.day(b26.auction)} yields ${K.pct(y, 3)}; a certificate of deposit has to offer ${K.pct(m.eq, 3)} to leave the same after-tax income. Kept in bills for a year, each ${K.usd(10000)} saves ${K.usd2(m.saved)} of Hawaii tax. The brackets for 2026 are the ones announced by the Department of Taxation after Act 46 of 2024, which said that tax year 2026 would keep the 2025 brackets, and they match the 2025 Form N-11 instructions. Hawaii has no county income tax, so the state rate is the only one that a CD pays and a Treasury avoids. The top rate of ${rp(top[1])} begins at ${K.usd(top[0])} for single filers.`,
  body: (h) => `
<h2>${nb} brackets, ${doubled ? 'with the joint ones exactly double' : 'single and joint'}</h2>
<p>${mostBrackets ? `No other state in our table has as many brackets as Hawaii. ` : ''}The low rates are used up quickly: a single filer is at ${rp(sg[6][1])} from ${K.usd(sg[6][0])}, and the steps above ${K.usd(sg[7][0])} come every ${K.usd(sg[9][0] - sg[8][0])} up to the top. ${doubled ? 'Every joint threshold is twice the single one, so a married couple pays the same rate as a single person with half their income.' : ''}</p>
${h.table(['Rate', 'Single, from', 'Married filing jointly, from'], rows, `Hawaii individual income tax brackets, tax year ${S.year}, the same as 2025 (Department of Taxation Announcement No. 2024-03; Form N-11 instructions).`, ['l', 'r', 'r'])}
<p>${higherTop.length && higherTop.length < ORD.length ? `Hawaii's ${rp(top[1])} top rate is the ${ORD[higherTop.length]} highest in the country, after ${higherTop.join(' and ')}.` : `The ${rp(top[1])} top rate applies above ${K.usd(top[0])}.`} It only matters to a few households. For a single filer with taxable income between ${K.usd(sg[5][0])} and ${K.usd(sg[9][0])}, the rate on bank interest is somewhere between ${rp(sg[5][1])} and ${rp(sg[8][1])}.</p>

<h2>Why the middle of the schedule is what counts</h2>
<p>The ${rp(r76)} rate begins at only ${K.usd(sg[6][0])} of taxable income for a single filer. That is already higher than the top rate of ${lowerTop} states that tax interest, in our table of the 50 states and the District. A schoolteacher or a retired civil servant on Oahu therefore gives up more of a bank CD's interest to the state than a millionaire would in those states. At that income the federal rate is ${K.pct(savers.f, 0)}, and the CD that matches the 26-week bill must pay ${K.pct(savers.eq, 3)}. This is the reason a Treasury bill or a savings bond is worth a look in Hawaii well below the income levels where people usually start thinking about taxes on interest.</p>

<h2>A retiree in Hilo, a couple in Honolulu</h2>
<p>A single retiree in Hilo with ${K.usd(50000)} of taxable income is already in the ${rp(hilo.s)} bracket, with ${K.pct(hilo.f, 0)} federal tax. Against the 26-week bill her break-even CD rate is ${K.pct(hilo.eq, 3)}. If she prefers four-week bills, which yielded ${K.pct(b4.investment / 100, 3)} at the auction of ${K.day(b4.auction)}, the bank must pay ${K.pct(hilo4.eq, 3)}. At the 26-week yield, ${K.usd(10000)} in bills keeps ${K.usd2(hilo.saved)} a year out of the state's hands.</p>
<p>A married couple in Honolulu with ${K.usd(700000)} of joint taxable income pays the top ${rp(hnl.s)} and the ${K.pct(hnl.f, 0)} federal rate. Their CD must pay ${K.pct(hnl.eq, 3)}; ${K.usd(10000)} held in T-bills saves them ${K.usd2(hnl.saved)} of Hawaii tax.</p>
${h.mini('teq', { t: 'Hawaii break-even rate with a four-week bill', p: ['y', 'inc'], d: { sx: SL, inc: 50000, y: b4.investment } })}

<h2>Line 18 of Form N-11</h2>
<p>Your federal adjusted gross income includes your T-bill and savings bond interest, and the Hawaii return takes it back out. The 2025 instructions for Form N-11 have you enter interest on federal obligations, Treasury bills and notes included, on line a of the Hawaii Subtractions Worksheet. The worksheet total goes to line 18, other Hawaii subtractions. Savings bond interest you report federally the year you cash the bonds is a federal obligation as well. For the West Coast comparison, see ${h.a('state:california', 'California')}; for how T-bill yields are quoted, ${h.a('t-bill-rates', 'current T-bill rates')}.</p>`,
  faqs: [
    { q: 'Does Hawaii tax Treasury bill interest?', a: `No. Hawaii lets you subtract interest on federal obligations, Treasury bills and notes included, through the Hawaii Subtractions Worksheet of Form N-11, as federal law requires. Interest from a bank CD or savings account is taxed at rates from ${rp(sg[0][1])} to ${rp(top[1])}. The federal tax on T-bill interest does not change.` },
    { q: 'Are the Hawaii income tax brackets the same in 2026 as in 2025?', a: `Yes. The Department of Taxation announced, after Act 46 of 2024, that the 2026 brackets would be the same as those of 2025. The single schedule has ${nb} brackets, from ${rp(sg[0][1])} up to ${rp(top[1])} above ${K.usd(top[0])}. The rates apply to taxable income, after the standard deduction or itemized deductions, which is the figure to enter in the calculator.` },
    { q: 'Do Hawaii counties charge an income tax on interest?', a: 'No. Hawaii has no county or city income tax, so the comparison between a Treasury bill and a bank CD involves only the state rate and the federal rate. That is simpler than in New York City, Portland or the Maryland counties, where a local tax adds to the advantage of Treasury interest.' },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:california'],
  toolArg: { inc: INC },
});
