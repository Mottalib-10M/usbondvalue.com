import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'district-of-columbia';
const S = K.S(SL);
const b26 = K.bill('26-Week'), b52 = K.bill('52-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const dc = (inc: number, st: 'single' | 'joint', yy = y, itemize = false) => {
  const f = K.fed(inc, st), s = K.stateRate(SL, inc, st).state;
  return { f, s, eq: K.teq(yy, f, s, itemize), saved: 10000 * yy * s };
};
const INC = 200000;
const w = dc(INC, 'single');
const wItem = dc(INC, 'single', y, true);
const sg = S.brackets.single, jt = S.brackets.joint;
const same = sg.length === jt.length && sg.every((x, i) => x[0] === jt[i][0] && x[1] === jt[i][1]);
const top = sg[sg.length - 1];
const k85 = sg.findIndex((x) => x[0] <= INC && (sg[sg.indexOf(x) + 1]?.[0] ?? Infinity) > INC);
const band = [sg[k85][0], sg[k85 + 1][0]];
const twins = K.STATE_SLUGS.filter((x) => x !== SL && K.topRate(x) === top[1]).map((x) => K.S(x).name);
const above = K.STATE_SLUGS.filter((x) => K.topRate(x) > top[1]).length;
const rows = sg.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), i + 1 < sg.length ? K.usd(sg[i + 1][0]) : 'and above']);
const cash = 50000;
const pair = dc(120000, 'joint'), big = dc(1200000, 'single', b52.investment / 100);

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: District of Columbia Tax',
  description: `The District of Columbia taxes CD interest at ${rp(w.s)} at ${K.usd(INC)} in 2026, whether you file single or jointly. T-bills pay none: a CD needs ${K.pct(w.eq, 3)} to match.`,
  intro: `The District taxes income like a state and a city at once, with ${same ? 'one schedule for every filing status' : 'its own schedules'}; interest from Treasury bills and savings bonds is exempt from it.`,
  resume: `A District resident with ${K.usd(INC)} of taxable income pays ${rp(w.s)} to the Office of Tax and Revenue on each extra dollar of bank interest, and ${K.pct(w.f, 0)} federal tax if single. Treasury bill and U.S. savings bond interest is free of District income tax under federal law. The 26-week bill auctioned on ${K.day(b26.auction)} yields ${K.pct(y, 3)}; a CD or money market account has to pay ${K.pct(w.eq, 3)} to leave as much after both taxes. If you itemize and deduct District tax on Schedule A within the federal cap, the equivalent is ${K.pct(wItem.eq, 3)} instead. Every ${K.usd(10000)} in bills for a year at that yield saves ${K.usd2(w.saved)} of District tax. The schedule${same ? ', the same for single filers, married couples and heads of household,' : ''} is not indexed for inflation, so the ${rp(sg[k85][1])} rate covers everything from ${K.usd(band[0])} to ${K.usd(band[1])}. There is no separate local tax: the District is a single jurisdiction.`,
  body: (h) => `
<h2>One table for everybody</h2>
<p>${same ? 'Many states give married couples wider brackets than single filers. The District does not: a couple filing jointly and a single person with the same taxable income pay the same rate.' : 'The District publishes its own schedules by filing status.'} For two earners, this means the household reaches the ${rp(sg[3][1])} rate at a combined ${K.usd(sg[3][0])}, a threshold that two modest salaries pass easily.</p>
${h.table(['Rate', 'Taxable income from', 'Up to'], rows, `District of Columbia individual income tax rates, tax years beginning after December 31, 2021, applied to ${S.year} (Office of Tax and Revenue). ${same ? 'Same schedule for every filing status.' : ''}`, ['l', 'r', 'r'])}
<p>At the top, ${rp(top[1])} applies above ${K.usd(top[0])}${twins.length ? `, a rate shared with ${twins.join(' and ')}` : ''}${above ? `; only ${above} ${above === 1 ? 'state has' : 'states have'} a higher top rate in our table` : ''}.</p>

<h2>The long ${rp(sg[k85][1])} band</h2>
<p>Between ${K.usd(band[0])} and ${K.usd(band[1])} of taxable income the District rate does not move. Lawyers, federal contractors and couples with two government salaries often fall inside it. For such a household, ${K.usd(cash)} held for a year in a savings account paying the bill's yield of ${K.pct(y, 3)} would cost ${K.usd2(cash * y * sg[k85][1])} in District tax. Held in Treasury bills at the same yield, it costs nothing in District tax, and the federal tax is the same in both cases.</p>

<h2>A Capitol Hill couple and a K Street partner</h2>
<p>A married couple on Capitol Hill with ${K.usd(120000)} of joint taxable income is in the ${rp(pair.s)} District bracket and the ${K.pct(pair.f, 0)} federal one. To match the 26-week bill, their savings account would have to pay ${K.pct(pair.eq, 3)}, and ${K.usd(10000)} in bills saves ${K.usd2(pair.saved)} a year. A single law firm partner with ${K.usd(1200000)} of taxable income who holds 52-week bills, last auctioned on ${K.day(b52.auction)} at ${K.pct(b52.investment / 100, 3)}, pays the top ${rp(big.s)} and ${K.pct(big.f, 0)} federally. The CD that equals his bill must pay ${K.pct(big.eq, 3)}; each ${K.usd(10000)} saves ${K.usd2(big.saved)} of District tax.</p>

<h2>Itemizing changes the arithmetic</h2>
<p>When District tax is deducted on federal Schedule A and you stay below the cap on state and local tax deductions, part of the District tax comes back as lower federal tax. The taxable equivalent then becomes the bill yield divided by one minus the District rate, without the federal factor. Turn the option on below to compare both cases at your own income.</p>
${h.mini('teq', { t: 'District of Columbia: with and without the Schedule A deduction', p: ['it', 'inc'], d: { sx: SL, it: 'yes', inc: 120000, st: 'joint' } })}

<h2>Schedule I of Form D-40</h2>
<p>Your federal adjusted gross income already includes your Treasury interest. On the District return it comes back out on Schedule I of Form D-40, the schedule of subtractions from federal income. Savings bond interest that you report federally the year you cash the bonds is a U.S. obligation too, protected by 31 U.S.C. 3124 (${h.src('usc_3124', 'U.S. Code')}). Across the line, ${h.a('state:maryland', 'Maryland')} adds a county tax to its state tax; for the federal side of savings bonds, see ${h.a('savings-bond-taxes', 'savings bond taxes')}.</p>`,
  faqs: [
    { q: 'Does the District of Columbia tax Treasury bill interest?', a: `No. Interest on Treasury bills, notes, bonds and U.S. savings bonds is exempt from District of Columbia income tax because federal law bars state and local taxes on it. It is subtracted on Schedule I of Form D-40. A bank CD's interest is taxed at District rates from ${rp(sg[0][1])} to ${rp(top[1])}.` },
    { q: 'Do married couples in the District of Columbia get wider tax brackets?', a: `${same ? 'No.' : 'The District has separate schedules.'} The District applies one rate schedule to every filing status, so a couple filing jointly reaches each rate at the same taxable income as a single filer. A couple with ${K.usd(120000)} of joint taxable income is in the ${rp(pair.s)} bracket, the same one a single person enters at ${K.usd(sg[3][0])}.` },
    { q: 'Is there a separate city income tax in the District of Columbia?', a: 'No. The District is one jurisdiction, so its income tax plays the role of both the state and the city tax found in places like New York. The only taxes on bank interest for a resident are the District tax and the federal tax, and Treasury interest is exempt from the first.' },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:maryland'],
  toolArg: { inc: INC },
});
