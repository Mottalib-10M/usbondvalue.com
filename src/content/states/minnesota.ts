import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const SL = 'minnesota';
const S = K.S(SL);
const b26 = K.bill('26-Week');
const y = b26.investment / 100;
const rp = (x: number) => { const r = Math.round(x * 1e6) / 1e6; let d = 0; while (d < 3 && Math.abs(r * 100 - Number((r * 100).toFixed(d))) > 1e-7) d++; return K.pct(r, d); };
const mn = (inc: number, st: 'single' | 'joint') => {
  const f = K.fed(inc, st), s = K.stateRate(SL, inc, st).state;
  return { f, s, eq: K.teq(y, f, s), saved: 10000 * y * s };
};
const INC = 130000;
const v = mn(INC, 'single');
const sg = S.brackets.single, jt = S.brackets.joint;
const top = sg[sg.length - 1];
const rows = sg.map(([lo, r], i) => [`<strong>${rp(r)}</strong>`, K.usd(lo), K.usd(jt[i][0]), K.usd(jt[i][0] - lo)]);
// Net investment income tax, read from the state row.
const niit = (S.surtax ?? '').match(/([\d.]+)% on net investment income above \$([\d,]+)/);
const niitRate = niit ? Number(niit[1]) / 100 : 0;
const niitAt = niit ? Number(niit[2].replace(/,/g, '')) : 0;
const duluth = mn(45000, 'single'), edina = mn(350000, 'joint');
const wide = jt[2][0] - jt[1][0];

export default defineState({
  slug: SL,
  title: 'T-Bill Tax Equivalent 2026: Minnesota State Tax Exempt',
  description: `Minnesota taxes bank interest at ${rp(v.s)} for a single filer at ${K.usd(INC)} in 2026, but not T-bill or savings bond interest. A CD needs ${K.pct(v.eq, 3)} to keep up.`,
  intro: `Minnesota's four rates run up to ${rp(top[1])}, and its subtraction for U.S. bond interest covers Treasury bills and savings bonds but not every security with "federal" in its name.`,
  resume: `Single filers in Minnesota with ${K.usd(INC)} of taxable income pay ${rp(v.s)} in state tax on an extra dollar of CD or savings account interest, and ${K.pct(v.f, 0)} in federal tax. The same dollar earned on a Treasury bill or a U.S. savings bond owes Minnesota nothing. With the 26-week bill auctioned on ${K.day(b26.auction)} at ${K.pct(y, 3)}, the taxable yield that leaves an equal amount after both taxes is ${K.pct(v.eq, 3)}. Each ${K.usd(10000)} held in bills for a year at that rate saves ${K.usd2(v.saved)} of Minnesota income tax. The 2026 brackets come from the Department of Revenue, which indexes them each year and rounds to the nearest ten dollars. Very large investors should know about one more piece: a ${rp(niitRate)} Minnesota tax on net investment income above ${K.usd(niitAt)}, which our calculator does not include. Interest on mortgage securities from Ginnie Mae, Fannie Mae or Freddie Mac does not qualify for the subtraction.`,
  body: (h) => `
<h2>The 2026 schedule, indexed and rounded</h2>
<p>Minnesota adjusts each threshold for inflation every year. The table shows where each rate begins for 2026, and in the last column how much further a joint return can go before reaching the same rate. The gap is not a constant ratio: the joint ${rp(jt[1][1])} band is ${K.usd(wide)} wide, far wider than the single one, which spares many two-income couples from the third rate.</p>
${h.table(['Rate', 'Single, from', 'Joint, from', 'Joint head start'], rows, `Minnesota individual income tax brackets, tax year ${S.year} (Minnesota Department of Revenue).`, ['l', 'r', 'r', 'r'])}

<h2>What counts as a U.S. bond in Minnesota</h2>
<p>The subtraction is for interest on obligations of the United States: Treasury bills, notes and bonds, and Series EE and I savings bonds. It is taken on Schedule M1M, net of any expenses tied to that income. Securities issued by the Government National Mortgage Association (Ginnie Mae), the Federal National Mortgage Association (Fannie Mae) and the Federal Home Loan Mortgage Corporation (Freddie Mac) are excluded, so their interest stays taxable in Minnesota even though the names sound federal. Read the name of the issuer on the statement before counting a holding as exempt.</p>

<h2>The net investment income tax</h2>
<p>Since tax year 2024 Minnesota has charged ${rp(niitRate)} on net investment income above ${K.usd(niitAt)}, reported on Schedule NIIT. It concerns very few households and sits on top of the brackets above. Its base starts from the federal net investment income figure, and we have not confirmed how Minnesota treats U.S. obligation interest inside it, so the calculator leaves this tax out. Below ${K.usd(niitAt)} of investment income it does not apply at all.</p>

<h2>Duluth and Edina</h2>
<p>A single worker in Duluth with ${K.usd(45000)} of taxable income pays ${rp(duluth.s)} to Minnesota and ${K.pct(duluth.f, 0)} federally. To match the bill, his savings account would need ${K.pct(duluth.eq, 3)}, and ${K.usd(10000)} in T-bills keeps ${K.usd2(duluth.saved)} of state tax a year. A couple in Edina with ${K.usd(350000)} of joint taxable income is in the top ${rp(edina.s)} bracket and the ${K.pct(edina.f, 0)} federal one; their CD must pay ${K.pct(edina.eq, 3)}, and the saving on the same ${K.usd(10000)} is ${K.usd2(edina.saved)}. Change the filing status below to see how the joint schedule moves the answer.</p>
${h.mini('teq', { t: 'Minnesota break-even rate for a joint return', p: ['st', 'inc'], d: { sx: SL, st: 'joint', inc: 350000 } })}
<p>Minnesota has no city or county income tax, so the state rate is the whole story. For the federal side of savings bond interest, see ${h.a('savings-bond-taxes', 'savings bond taxes')}; for another state whose top rate is close to ${rp(top[1])}, ${h.a('state:oregon', 'Oregon')}.</p>`,
  faqs: [
    { q: 'Does Minnesota tax interest on Treasury bills and savings bonds?', a: `No. Minnesota subtracts interest on U.S. obligations on Schedule M1M, so Treasury bill, note and bond interest and the interest on Series EE and I savings bonds are not taxed by the state. A CD or savings account is taxed at rates from ${rp(sg[0][1])} to ${rp(top[1])}. The federal return still includes all of it.` },
    { q: 'Is Ginnie Mae or Fannie Mae interest exempt in Minnesota?', a: 'No. Minnesota excludes securities of the Government National Mortgage Association, the Federal National Mortgage Association and the Federal Home Loan Mortgage Corporation from its subtraction for U.S. bond interest. Their interest is taxed like bank interest. Only direct obligations of the United States, such as Treasury bills and savings bonds, qualify.' },
    { q: 'Does the Minnesota net investment income tax change the T-bill comparison?', a: `Only above ${K.usd(niitAt)} of net investment income, where Minnesota adds ${rp(niitRate)}. Below that threshold it plays no role. Its base starts from the federal figure, and we did not confirm how Minnesota handles U.S. obligation interest within it, so our calculator ignores it. Check Schedule NIIT if your investment income is that large.` },
  ],
  related: ['t-bill-state-tax', 't-bill-vs-cd', 't-bill-rates', 'savings-bond-taxes', 'state:oregon'],
  toolArg: { inc: INC },
});
