/** Home page text. Every figure comes from the kit (src/lib/kit.ts). */
import type { FAQ, Helpers } from '../lib/page-types';
import { KIT as K } from '../lib/kit';

const W = K.R.i.windows[K.R.i.windows.length - 1];
const iNew = K.composite(W.fixed, W.inflation);
const nx = K.next();
const nextWithSameFixed = K.composite(W.fixed, nx.value);
const b26 = K.bill('26-Week'), b4 = K.bill('4-Week'), b52 = K.bill('52-Week');
// Worked case of the home page: $10,000 electronic I bond bought in January 2022, valued this month.
const ex = K.bond('I', '2022-01', K.BUILD, 'electronic', 10000);
const exPaper = K.bond('EE', '2006-06', K.BUILD, 'paper', 100);
const ee = K.R.eeCurrent;
const coh = K.cohorts();
const zero = coh.filter((c) => c.fixed === 0);
const top = [...coh].sort((a, b) => b.fixed - a.fixed)[0];
const rateText = (r: number[]) => r.map((x) => K.pct(x)).join(' or ');
const span = (c: { from: string; to: string }) => (c.from === c.to ? K.month(c.from) : `${K.month(c.from)} to ${K.month(c.to)}`);
const nextLine = nx.official ? `${K.pct(nextWithSameFixed)} from ${K.day(K.P.nextIBond.date)}` : `announced ${K.day(K.P.nextIBond.date)}`;

export const HOME = {
  title: 'Savings Bond Calculator 2026: EE and I Bond Value, US',
  description: 'Savings bond calculator for 2026: value of any EE or I bond, paper or electronic, month by month, with the current I bond rate by issue month and T-bill yields.',
  h1: 'What is your savings bond worth this month?',
  intro: 'The value of any Series EE or I savings bond, paper or electronic, on the first day of any month, with the three-month penalty, the 20-year doubling of EE bonds and the 30-year stop applied as the Treasury applies them.',
  trust: `Rates announced through ${K.month(K.LAST)}, auctions read ${K.day(K.A.built)}`,
  strip: [
    { k: `New I bonds, ${K.month(K.LAST).split(' ')[0]} to ${K.month(K.NEXT).split(' ')[0] === 'November' ? 'October' : 'April'}`, v: K.pct(iNew), d: `Fixed rate ${K.pct(W.fixed)}, inflation ${K.pct(W.inflation)} a half-year.`, id: 'i-bond-rates', l: 'Every rate' },
    { k: 'Next I bond rate', v: nx.official ? K.pct(nextWithSameFixed) : 'Nov 1', d: nx.official ? 'Announced by the Treasury.' : `Inflation part already ${K.pct(nx.value)} from the CPI.`, id: 'next-i-bond-rate', l: 'The math' },
    { k: 'New EE bonds', v: K.pct(ee), d: 'Fixed for 20 years; the value doubles at 20 years whatever the rate.', id: 'ee-bonds', l: 'EE rules' },
    { k: `26-week T-bill, ${K.day(b26.auction)}`, v: K.pct(b26.investment / 100, 3), d: `4-week ${K.pct(b4.investment / 100, 3)}, 52-week ${K.pct(b52.investment / 100, 3)}.`, id: 't-bill-rates', l: 'All terms' },
  ],
  resume: `A savings bond is worth its price plus the interest added on the first day of each month, minus the last three months of interest if it is less than five years old. The calculator above rebuilds that value from the Treasury's own rules in 31 CFR parts 351 and 359, for paper bonds (by face value) and for electronic bonds (by the amount paid, to the cent), and we checked the method against every redemption table the Treasury published from 1999 to 2023. An electronic I bond of ${K.usd(10000)} bought in January 2022 is worth ${ex.ok ? K.usd2(ex.value!) : 'n/a'} on ${K.month(K.BUILD).replace(' ', ' 1, ')}, after a penalty of ${K.usd2(ex.penaltyCost)}; it earns ${ex.rate === undefined ? 'n/a' : K.pct(ex.rate)} in its current period because its fixed rate is ${K.pct(K.iFixed('2022-01'))}. A ${K.usd(100)} paper EE bond of June 2006 is worth ${exPaper.ok ? K.usd2(exPaper.value!) : 'n/a'}. I bonds bought from May to October 2026 earn ${K.pct(iNew)}; the rate for November 2026 to April 2027 is ${nextLine}. Treasury bills paid ${K.pct(b26.investment / 100, 3)} at the 26-week auction of ${K.day(b26.auction)}, free of state income tax.`,
  cohortTitle: `The rate every I bond earns in ${K.month(K.BUILD)}`,
  cohortIntro: `An I bond keeps the fixed rate of its issue month for 30 years and adds the inflation rate announced every May 1 and November 1, starting with its own six-month anniversaries. Bonds issued in the same window share a fixed rate, so they earn the same composite rate this month.`,
  cohortHead: ['Issued', 'Fixed rate', `Rate in ${K.month(K.BUILD)}`],
  cohortRows: coh.filter((c) => c.rates.length).slice().reverse().map((c) => [span(c), K.pct(c.fixed), rateText(c.rates)]),
  cohortCaption: `Composite rate = fixed + 2 × semiannual inflation + fixed × inflation, rounded to 0.01 %, never below zero (31 CFR 359). Bonds older than 30 years no longer earn interest. Source: TreasuryDirect rate history, read ${K.day(K.P.retrieved_at)}.`,
  why: (h: Helpers) => `
<h2>Why the Treasury's calculator does not answer the question</h2>
<p>The official Savings Bond Calculator says it in its first lines: it is for paper bonds only. Electronic bonds, the only kind sold today (paper EE bonds ended in 2012, paper I bonds on January 1, 2025), are valued inside a TreasuryDirect account, and the account shows today's value, not the value next month, at the end of the penalty or on the date someone died. ${h.src('td_calc', 'Read the official page')}. Its forms ask for one bond at a time with a serial number, and the values it prints for future months stop at the end of the current six-month period.</p>
<p>The method behind those values is public. Each bond is a count of units: a ${K.usd2(K.P.bonds.iUnit)} unit for Series I and a ${K.usd2(K.P.bonds.eeUnit)} unit for Series EE. Every six months from the issue month, the value of a unit is grown by half the annual rate and rounded to the cent; within the six months, interest is added on the first of each month by compounding, again rounded to the cent. A paper bond is that many units; an electronic bond is valued as a ${K.usd(100)} bond and scaled to its exact price. We wrote those rules into one engine and compared it with all 291 redemption tables published on Fiscal Data from 1999 to 2023: 93,786 values for ${K.usd(100)} bonds, all equal to the cent.</p>
<p>Rates are the other half. The I bond composite for a period comes from the fixed rate of the issue month and the inflation rate of the last announcement, which the Treasury publishes in a workbook going back to 1998. EE bonds bought since May 2005 keep the rate of their issue month; older EE bonds follow tables that changed every six months. The site reads those tables, and the auction results of Treasury bills from the Fiscal Data API, when it is built.</p>
${h.mini('rate', { t: 'Check the rate of one I bond', p: ['im', 'iy'] })}
<p>Treasury bills are the other place savers park cash at the federal government. They pay no coupon: you buy at a discount and receive the face value at maturity. Like savings bond interest, bill interest is taxed by the IRS but not by states or cities (31 U.S.C. 3124), which is worth most in high-tax states. ${h.a('t-bill-state-tax', 'The state tax calculator')} uses each state's own schedule instead of a rate you have to guess.</p>`,
  sections: (h: Helpers) => [
    { title: 'Paper or electronic: which one you own', html: `<p>A paper bond shows a face value, an issue date in the upper right corner and the owner's name. Paper EE bonds were sold at half their face value and paper I bonds at face value. Paper EE bonds date from 1980 to 2012; paper I bonds were sold at banks and through payroll savings until 2012, and with federal tax refunds until the end of 2024. Anything bought in a TreasuryDirect account is electronic, valued from the exact amount paid. If you hold paper bonds you can cash them at a bank, ${h.a('cash-savings-bonds', 'send them to the Treasury')}, or convert them into an electronic account.</p>` },
    { title: 'Three dates that change the value', html: `<p>Twelve months after issue the bond can be cashed. Until five years after issue, cashing it costs the last three months of interest. For an EE bond issued since June 2003, the Treasury raises the value to twice the price at 20 years if the rate has not done it already: at the current ${K.pct(ee)} fixed rate, that step is the bulk of the return. Thirty years after issue, interest stops on both series, and the bond should be cashed because nothing more is added. ${h.a('matured-savings-bonds', 'Matured bonds')} keep their final value with no deadline.</p>` },
    { title: 'Tax: federal yes, state and local no', html: `<p>Interest on savings bonds and Treasury bills is subject to federal income tax and exempt from state and local income tax. Savings bond interest can be reported each year or, as most owners do, all at once in the year the bond is cashed, reaches final maturity or changes owner. Interest used for college tuition may be excluded with Form 8815 under an income limit. ${h.a('savings-bond-taxes', 'How the federal tax works')}, ${h.a('savings-bonds-for-education', 'the education exclusion')} and ${h.a('inherited-savings-bonds', 'bonds that pass to heirs')} each have a page.</p>` },
  ],
  faqs: [
    { q: 'How do I find out how much my savings bond is worth?', a: 'Pick the series and form, the issue month and year printed on the bond or shown in TreasuryDirect, and the amount. For a paper bond the amount is the face value; for an electronic bond it is the price you paid. The calculator returns the value on the first day of the month you choose, the interest earned, the rate of the current period and the penalty if the bond is under five years old.' },
    { q: 'Is the value the same for a paper and an electronic bond?', a: 'Yes for round amounts. Both follow the same rates and units, but a paper bond is a whole number of $25 or $12.50 units, while an electronic bond is valued as a $100 bond and scaled to its exact price, rounded to the cent. For round amounts such as $1,000 the two values are identical on the same date; an electronic bond bought for an odd amount like $36.73 can differ by a cent from the plain proportion. The calculator applies the rounding of each form.' },
    { q: 'Why does my I bond show less than its rate suggests?', a: 'Until a bond is five years old, its value excludes the last three months of interest, and the calculator shows that penalty in dollars. Interest is also added only on the first day of each month, so a bond bought on the 28th earns nothing more until the 1st. And the rate shown applies to the current six-month period only; earlier periods may have paid more or less.' },
    { q: 'When will the November 2026 I bond rate be known?', a: 'The Treasury announces it on November 1, 2026. The inflation part is already set by the consumer price index for March and September, so the only unknown is the fixed rate for new bonds. The next rate page shows the composite each fixed rate would give, and the site is updated with the official figures on the day they are published.' },
    { q: 'Can I see what my bond will be worth next year?', a: 'Up to the end of the six-month period whose rate is announced, the value is exact. After that, the value depends on rates not set yet. Under More options you can project those months at the bond’s current rate, which the calculator labels as a projection. EE bonds issued since May 2005 have a fixed rate, so their future value is known except for the 20-year step.' },
    { q: 'How do you know the values are right?', a: `The engine applies the Treasury's own rules, then is tested against every value of the ${K.num(K.P.checks.redemptionTables)} redemption tables the Treasury published from ${K.month(K.P.checks.tablesFrom)} to ${K.month(K.P.checks.tablesTo)}: ${K.num(K.P.checks.redemptionValues)} values for ${K.num(K.P.checks.issueMonths)} issue months, all matched to the cent. The tests run at every build, so a rule change that breaks one value stops the site from being published.` },
  ] as FAQ[],
  sources: ['cfr_351', 'cfr_359', 'td_ibond_rates', 'td_ibond_history', 'td_ee2005', 'td_calc', 'fd_redemption', 'fd_auctions', 'usc_3124'],
};
