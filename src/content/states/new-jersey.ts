import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'new-jersey';
const S = K.S(SL);
const b26 = K.bill('26-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const at = (inc: number, st: 'single' | 'joint') => {
  const f = K.fed(inc, st), s = K.stateRate(SL, inc, st).state;
  return { f, s, eq: K.teq(y, f, s), saved: 10000 * y * s };
};
const INC = 160000;
const base = at(INC, 'single');
const sg = S.brackets.single, jt = S.brackets.joint;
// One row per rate: the joint schedule has a rate the single one skips.
const rates = jt.map((x) => x[1]);
const rows = rates.map((r) => {
  const a = sg.find((x) => x[1] === r), b = jt.find((x) => x[1] === r)!;
  return [`<strong>${rp(r)}</strong>`, a ? K.usd(a[0]) : 'no such bracket', K.usd(b[0])];
});
const extra = jt.find((x) => !sg.some((z) => z[1] === x[1]));
const top = sg[sg.length - 1], second = sg[sg.length - 2], third = sg[sg.length - 3];
const twins = K.STATE_SLUGS.filter((x) => x !== SL && K.topRate(x) === K.topRate(SL)).map((x) => K.S(x).name);
const nurse = at(70000, 'single'), couple = at(650000, 'joint');
const cliffSaved = 10000 * y * (second[1] - third[1]);

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: New Jersey Income Tax Saved',
  description: `New Jersey taxes bank CD interest at ${rp(base.s)} for a single filer at ${K.usd(INC)} in 2026; T-bills and savings bonds pay none of it. Break-even CD rate: ${K.pct(base.eq, 3)}.`,
  intro: `New Jersey's income tax rates are written into the statute and have not moved since 2020, so the gap between a Treasury bill and a bank CD here depends only on the yield and your bracket.`,
  resume: `At ${K.usd(INC)} of taxable income, a single New Jersey filer pays ${rp(base.s)} of Gross Income Tax on each additional dollar of bank interest and ${K.pct(base.f, 0)} federal tax on it. Treasury bill and savings bond interest is exempt from the state tax under federal law. With the 26-week bill sold on ${K.day(b26.auction)} at ${K.pct(y, 3)}, a certificate of deposit has to pay ${K.pct(base.eq, 3)} before it leaves as much after tax. Each ${K.usd(10000)} held a full year at the bill's yield avoids ${K.usd2(base.saved)} of New Jersey tax. The schedule used here is the one the Division of Taxation labels "2020 and After"; rates and thresholds are set by law and not indexed for inflation, so the same table applies in 2026. The jump that matters most comes at ${K.usd(second[0])}, where the rate moves from ${rp(third[1])} to ${rp(second[1])}, and again at ${K.usd(top[0])}, where it reaches ${rp(top[1])}. New Jersey has no local income tax that reaches interest.`,
  body: (h) => `
<h2>Two schedules that do not line up</h2>
<p>A couple filing jointly in New Jersey does not get thresholds that are simply twice the single ones. The joint schedule has its own breakpoints and one extra rate${extra ? `, ${rp(extra[1])}, starting at ${K.usd(extra[0])}` : ''}. A single filer, meanwhile, passes through a very short ${rp(sg[2][1])} band, from ${K.usd(sg[2][0])} to ${K.usd(sg[3][0])}, before the ${rp(sg[3][1])} rate. The Division's note to the schedule says the joint column is also the one for heads of household and qualifying widows or widowers.</p>
${h.table(['Rate', 'Single, from', 'Joint, head of household, from'], rows, `New Jersey Gross Income Tax rate schedules, "2020 and After" (Division of Taxation), used for tax year ${S.year}.`, ['l', 'r', 'r'])}
<p>The calculator on this page follows that note: with the Head status it applies the joint New Jersey schedule for the state rate and the federal head of household brackets for the federal rate, so a head of household gets both rates from one setting. In states that publish no separate schedule, the Head status uses the single one.</p>

<h2>Half a million: the step to ${rp(second[1])}</h2>
<p>Between ${K.usd(sg[4][0])} and ${K.usd(second[0])} the rate is a steady ${rp(third[1])}. Above ${K.usd(second[0])} it climbs from ${rp(third[1])} to ${rp(second[1])} in a single step, which changes the comparison for households with large cash balances. On ${K.usd(10000)} at the current bill yield, that step alone is worth ${K.usd2(cliffSaved)} a year in tax that a Treasury avoids. Above ${K.usd(top[0])} the rate is ${rp(top[1])}${twins.length ? `, the same top rate as ${twins.map((n) => (n.startsWith('District') ? `the ${n}` : n)).join(' and ')}` : ''}.</p>

<h2>A nurse in Trenton and a couple in Bergen County</h2>
<p>A single nurse with ${K.usd(70000)} of taxable income is in the ${rp(nurse.s)} bracket and the ${K.pct(nurse.f, 0)} federal one. A CD must pay ${K.pct(nurse.eq, 3)} to match the T-bill, and ${K.usd(10000)} in bills saves ${K.usd2(nurse.saved)} of state tax over a year. A married couple filing jointly at ${K.usd(650000)} pays ${rp(couple.s)} in New Jersey and ${K.pct(couple.f, 0)} federally; their break-even is ${K.pct(couple.eq, 3)}, and the same ${K.usd(10000)} saves ${K.usd2(couple.saved)}.</p>

<h2>Savings bonds cashed in New Jersey</h2>
<p>When you cash Series EE or I bonds, the whole interest lands on your federal return for that year, often in one lump. New Jersey cannot tax any of it. The small calculator below takes the interest on the bonds you cash and shows both the federal tax and the New Jersey tax a bank account would have cost on the same amount.</p>
${h.mini('bondtax', { t: 'Cashing bonds in New Jersey: federal tax and state tax avoided', p: ['int'], d: { int: 2400, inc: 160000, sx: SL } })}
<p>On the NJ-1040, interest on U.S. obligations stays out of New Jersey taxable income; follow the Division's instructions for the year to see how it is listed. The legal basis is 31 U.S.C. 3124 (${h.src('usc_3124', 'U.S. Code')}). For the city across the river, see ${h.a('state:new-york', 'New York with the city tax')}; for the federal rules, ${h.a('savings-bond-taxes', 'savings bond taxes')}.</p>`,
  faqs: [
    { q: 'Does New Jersey tax interest from Treasury bills?', a: `No. Interest on Treasury bills, notes, bonds and U.S. savings bonds is exempt from New Jersey Gross Income Tax because federal law forbids state taxation of it. It is still taxable on the federal return. Interest from a New Jersey bank CD is taxable by the state, at ${rp(sg[0][1])} to ${rp(top[1])} depending on income.` },
    { q: 'Are New Jersey tax brackets adjusted for inflation in 2026?', a: `No. The rates and thresholds are fixed by statute, and the Division of Taxation presents the same schedule for every year from 2020 on. A saver whose income rises with inflation can therefore move into a higher New Jersey bracket without any real raise, which makes tax-exempt Treasury interest slightly more valuable over time.` },
    { q: 'Which New Jersey schedule does a head of household use?', a: `The joint schedule, according to the Division's note on the rate tables. It starts the ${rp(jt[3][1])} rate at ${K.usd(jt[3][0])} and the ${rp(jt[jt.length - 3][1])} rate at ${K.usd(jt[jt.length - 3][0])}, later than the single schedule. The calculator on this page applies it when you pick Head as the filing status.` },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:new-york'],
  toolArg: { inc: INC },
});
