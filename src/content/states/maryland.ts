import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'maryland';
const S = K.S(SL);
const b26 = K.bill('26-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const LR = S.localRange!;
const typ = LR.typical ?? LR.max;
/** County rate as the calculator field expects it (percent, two decimals). */
const asField = (r: number) => Math.round(r * 10000) / 100;
const md = (inc: number, st: 'single' | 'joint', county: number) => {
  const f = K.fed(inc, st), s = K.stateRate(SL, inc, st).state, sl = s + county;
  return { f, s, c: county, sl, eq: K.teq(y, f, sl), saved: 10000 * y * sl };
};
const INC = 110000;
const v = md(INC, 'single', typ);
const sg = S.brackets.single, jt = S.brackets.joint;
const top = sg[sg.length - 1];
const rows = sg.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), K.usd(jt[i][0])]);
const countyRows = [
  ['Worcester (lowest)', `<strong>${rp(LR.min)}</strong>`],
  ['Montgomery, Prince George&rsquo;s, Baltimore County, Howard, Baltimore City and most others', `<strong>${rp(typ)}</strong>`],
  ['Dorchester and Kent (highest)', `<strong>${rp(LR.max)}</strong>`],
];
const ocean = md(INC, 'single', LR.min), kent = md(320000, 'joint', LR.max);
const spread = 10000 * y * (LR.max - LR.min);

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: Maryland State and County',
  description: `In 2026 Maryland and its counties tax CD interest at ${rp(v.sl)} for a single filer at ${K.usd(INC)} in most counties; T-bills pay neither. Break-even CD: ${K.pct(v.eq, 3)}.`,
  intro: 'Every Maryland resident pays two income taxes on bank interest, one to the state and one to the county or Baltimore City, and Treasury bill and savings bond interest is exempt from both.',
  resume: `A single filer in Montgomery County, Baltimore City or most other Maryland jurisdictions with ${K.usd(INC)} of taxable income pays ${rp(v.s)} in state tax and ${rp(v.c)} in county tax on each extra dollar of CD interest, ${rp(v.sl)} together, on top of a ${K.pct(v.f, 0)} federal rate. T-bill and savings bond interest owes neither tax. The 26-week bill auctioned on ${K.day(b26.auction)} yields ${K.pct(y, 3)}; a bank deposit must pay ${K.pct(v.eq, 3)} to leave the same after tax. Held for a year, each ${K.usd(10000)} in bills saves ${K.usd2(v.saved)} of Maryland state and local tax. County rates for 2026 run from ${rp(LR.min)} in Worcester to ${rp(LR.max)} in Dorchester and Kent, and the calculator above starts at the ${rp(typ)} rate that most of the state pays; change it under the advanced options. The state brackets are those of the Comptroller's 2026 estimated tax worksheet, with the two top rates added in 2025.`,
  body: (h) => `
<h2>State brackets: tiny at the bottom, new at the top</h2>
<p>Maryland's schedule starts with three brackets only ${K.usd(sg[1][0])} wide each, then a long ${rp(sg[3][1])} band. The 2025 legislative session (House Bill 352) added two rates for high incomes, ${rp(sg[sg.length - 2][1])} and ${rp(top[1])}. Schedule I covers single filers; Schedule II covers married couples filing jointly, heads of household and qualifying surviving spouses.</p>
${h.table(['Rate', 'Schedule I (single), from', 'Schedule II (joint, head), from'], rows, `Maryland state income tax brackets, tax year ${S.year} (Comptroller of Maryland, 2026 estimated tax worksheet).`, ['l', 'r', 'r'])}
<p>Maryland also has an additional tax on net capital gains once federal adjusted gross income is high. It is figured on gains only, so it plays no part in the choice between a CD and a T-bill.</p>

<h2>The county tax is the second layer</h2>
<p>Each county and Baltimore City sets its own local income tax, applied to Maryland taxable net income. Because it uses that state figure, the subtraction for U.S. obligations removes Treasury interest from the county base too. Anne Arundel and Frederick use graduated county rates; elsewhere the rate is flat.</p>
${h.table(['County', '2026 local rate'], countyRows, 'Maryland local income tax rates on residents, 2026 (Comptroller worksheet). Anne Arundel and Frederick are graduated.', ['l', 'r'])}
<p>In Anne Arundel and Frederick the county rate depends on income, so enter the rate of the county bracket your taxable income falls in, as listed in the Comptroller's worksheet. Nonresidents who earn Maryland income pay a special nonresident tax instead of a county tax, a case this page does not cover.</p>
<p>The difference between the cheapest and the dearest county is ${rp(LR.max - LR.min)}. On ${K.usd(10000)} of CD interest at the bill's yield, that alone is ${K.usd2(spread)} a year.</p>

<h2>Ocean City against Chestertown</h2>
<p>Move the single filer from the summary to Ocean City in Worcester County: the state takes ${rp(ocean.s)}, the county ${rp(ocean.c)}, and the break-even CD rate falls to ${K.pct(ocean.eq, 3)}. A married couple in Chestertown, Kent County, with ${K.usd(320000)} of joint taxable income pays ${rp(kent.s)} to the state and ${rp(kent.c)} to the county, with a ${K.pct(kent.f, 0)} federal rate. For them the CD must pay ${K.pct(kent.eq, 3)}, and ${K.usd(10000)} in T-bills avoids ${K.usd2(kent.saved)} a year. Try your own county rate in the small calculator.</p>
${h.mini('teq', { t: 'Your Maryland county rate and the T-bill', p: ['loc', 'inc'], d: { sx: SL, loc: asField(LR.max), inc: 250000 } })}

<h2>Code ab on Form 502SU</h2>
<p>Your federal adjusted gross income includes the interest, and the Maryland return takes it back out. Interest on U.S. government obligations comes out through Form 502SU, the subtractions schedule, under code ab, and the total goes to line 13 of Form 502. Interest on Ginnie Mae securities is excluded from that code. The 2025 resident booklet notes that the subtraction also reduces the base of the local tax. Next door, ${h.a('state:district-of-columbia', 'the District of Columbia')} has a single tax with no county layer; for the bank side of the comparison, see ${h.a('t-bill-vs-cd', 'T-bills against CDs')}.</p>`,
  faqs: [
    { q: 'Do Maryland counties tax interest from Treasury bills?', a: `No. The county and Baltimore City income taxes are computed on Maryland taxable net income, after the subtraction for U.S. government obligations, so T-bill and savings bond interest never reaches them. Bank interest does, at county rates from ${rp(LR.min)} to ${rp(LR.max)} in 2026, in addition to the state rate.` },
    { q: 'What county rate should a Maryland resident enter in the calculator?', a: `The rate of the county, or of Baltimore City, where you live; the 2026 rates are listed in the Comptroller's estimated tax worksheet. Most of the state, including Montgomery, Prince George's, Baltimore County, Howard and Baltimore City, is at ${rp(typ)}, which is the default here. Worcester is the lowest at ${rp(LR.min)}; Dorchester and Kent the highest at ${rp(LR.max)}.` },
    { q: 'Which Maryland form removes savings bond and T-bill interest?', a: 'Form 502SU, the schedule of subtractions, using code ab for income from U.S. government obligations. The total of that schedule is carried to line 13 of Form 502. Ginnie Mae interest does not qualify under that code. The same subtraction lowers the county tax, since the county tax starts from the state figure.' },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:district-of-columbia'],
  toolArg: { inc: INC, loc: asField(typ) },
});
