import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

// Worked case: $4,000 of interest on top of $85,000 of other taxable income, single filer.
const INT = 4000, INC = 85000;
const t = K.fedTax(INC + INT, 'single') - K.fedTax(INC, 'single');
// Bunching: $24,000 of interest in one year against $6,000 in each of four years, same other income.
const BIG = 24000, YEARS = 4, OTHER = 90000;
const once = K.fedTax(OTHER + BIG, 'single') - K.fedTax(OTHER, 'single');
const spread = YEARS * (K.fedTax(OTHER + BIG / YEARS, 'single') - K.fedTax(OTHER, 'single'));
const bunchRows = [
  [`All ${K.usd(BIG)} in one year`, K.usd(once), K.pct(once / BIG, 1)],
  [`${K.usd(BIG / YEARS)} a year for ${YEARS} years`, K.usd(spread), K.pct(spread / BIG, 1)],
  ['Difference', K.usd(once - spread), ''],
];
// Federal marginal rate on interest by taxable income, 2026 brackets.
const lv = [40000, 80000, 150000, 250000];
const rateRows = lv.map((x) => [K.usd(x), K.pct(K.fed(x, 'single'), 0), K.pct(K.fed(x, 'joint'), 0), K.usd(1000 * K.fed(x, 'single'))]);
// Pub. 550 example: EE bond bought for $500 in March 2006, redeemed in March 2025 for $913.60.
const PX = K.P.tax.p550Example;
const pubInt = PX.proceeds - PX.price;
const ca = K.stateRate('california', INC, 'single').state;

export default defineGuide({
  id: 'savings-bond-taxes',
  group: 'tax',
  order: 20,
  slug: 'savings-bond-taxes',
  nav: 'Savings bond taxes',
  card: 'Federal tax only, and when to report the interest',
  title: 'Savings Bond Taxes 2026: Federal Tax on EE and I Bonds, US',
  description: `Savings bond taxes in 2026: interest is federally taxed, never by states. On ${K.usd(INT)} of interest a single filer at ${K.usd(INC)} owes ${K.usd(t)}. When to report it.`,
  h1: 'Savings bond taxes: what you owe and when you report it',
  intro: `Savings bond interest is taxed only by the federal government, as ordinary income. You choose when to report it: all at once when you cash, or a little every year. The calculator gives the federal tax.`,
  resume: `Interest on EE and I savings bonds is subject to federal income tax and exempt from state and local income tax. It is the difference between what you paid and what you receive, and it is taxed at your ordinary rate, not as a capital gain. Most owners report it in the year they cash the bond, or in the year it reaches final maturity at 30 years if that comes first; that is method 1 in IRS Publication 550. The alternative, method 2, is to report each year's increase in value. For a single filer with ${K.usd(INC)} of other taxable income, ${K.usd(INT)} of bond interest adds ${K.usd(t)} of federal tax under the 2026 brackets, at a marginal rate of ${K.pct(K.fed(INC + INT, 'single'), 0)}. In California the same interest from a bank account would also cost ${K.usd(INT * ca)} of state tax; from a savings bond it costs none. The interest is reported on Form 1099-INT, box 3, and may be excluded altogether when it pays for higher education.`,
  faqs: [
    { q: 'Do I have to pay taxes on savings bonds every year?', a: 'No, unless you choose to. Most owners defer the tax until they cash the bond or it stops earning at 30 years, and report all the interest that year. You may instead report the increase in value every year; once chosen, that method applies to all your EE and I bonds until you ask the IRS to change it.' },
    { q: 'Are savings bonds taxed by my state?', a: 'No. Interest on U.S. savings bonds is exempt from state and local income tax under 31 U.S.C. 3124. On most state returns you subtract it from income, since it is included in federal adjusted gross income. Savings bonds remain subject to federal estate and gift taxes and to state estate or inheritance taxes.' },
    { q: 'What if my 1099-INT includes interest I already reported?', a: 'List the full amount on Schedule B, then enter a subtotal and, below it, “U.S. Savings Bond Interest Previously Reported” with the amount already taxed, and subtract it. Publication 550 gives this method for bonds whose interest was reported each year, and for bonds that were reissued to you with interest earned before.' },
    { q: 'Who pays the tax on a bond in a child’s name?', a: 'The child, if the child is the only owner, even when a parent paid for it. A bond with two co-owners is taxed to the one who paid for it, or shared in proportion when both paid. Reporting a child’s bond interest each year can keep it in a low bracket, but the rules on a child’s unearned income may apply.' },
  ],
  body: (h) => `
<h2>Federal rate on each extra dollar of interest</h2>
<p>Bond interest is added to your other income and taxed at your top bracket, under the 2026 brackets set by Revenue Procedure 2025-32 (${h.src('irs_rp_2025_32', 'IRS, Rev. Proc. 2025-32')}). The table gives the marginal rate at four levels of taxable income, and what ${K.usd(1000)} of interest costs at that rate for a single filer.</p>
${h.table(['Taxable income', 'Single', 'Joint', 'Tax on $1,000, single'], rateRows, '2026 federal income tax brackets. Taxable income after deductions.', ['r', 'r', 'r', 'r'])}
${h.mini('bondtax', { t: 'Federal tax on your interest', p: ['int', 'inc'], d: { int: 12500, inc: 60000, st: 'joint' } })}

<h2>Method 1 or method 2</h2>
<p>Publication 550 gives cash-method taxpayers, which means nearly all individuals, two options (${h.src('irs_p550', 'IRS Publication 550')}). Under method 1 you report the interest in the year the bond is cashed, disposed of or reaches final maturity, whichever comes first. Under method 2 you report the increase in value each year. Switching from method 1 to method 2 needs no permission, but in the year of change you report all interest accrued to date on all your bonds. Switching back needs the IRS's permission, which is granted automatically when you attach a statement headed "131" to your return for the year of change, with the details the publication lists, or when you file Form 3115.</p>
<p>TreasuryDirect explains the same choice from the holder's side (${h.src('td_tax', 'TreasuryDirect, tax information')}): whichever method you use, the 1099-INT comes only at the end and shows all the interest the bond ever earned. If you reported it along the way, you subtract the part already taxed on Schedule B. Publication 550's own example is an EE bond bought for ${K.usd2(PX.price)} in ${K.month(PX.issued)} and cashed in ${K.month(PX.redeemed)} for ${K.usd2(PX.proceeds)}: the 1099-INT shows ${K.usd2(pubInt)}, but an owner who had reported yearly includes only the interest of the last months.</p>

<h2>Bunching the interest into one year</h2>
<p>Under method 1, decades of interest can land in a single year. When that pushes income into a higher bracket, spreading redemptions over several years lowers the total tax. The table compares ${K.usd(BIG)} of bond interest received in one year with the same amount spread over ${YEARS} years, for a single filer with ${K.usd(OTHER)} of other taxable income, using the 2026 brackets for every year.</p>
${h.table(['Timing', 'Federal tax on the interest', 'Share'], bunchRows, 'Same 2026 brackets applied to each year; real brackets are indexed to inflation every year.', ['l', 'r', 'r'])}
<p>The saving comes only from staying under a bracket threshold. Someone whose income is far from the next threshold pays the same either way. Bonds at final maturity cannot be spread, since the interest is taxable in that year whether cashed or not; the ${h.a('matured-savings-bonds', 'matured bonds page')} shows which cohorts reach 30 years soon.</p>

<h2>Who reports the interest</h2>
<p>The owner who paid for the bond reports its interest. If you buy a bond in your name with a co-owner, you owe the tax; if two co-owners each paid part, each reports in proportion to what they paid. A bond bought for a child and registered in the child's name alone is the child's income, even if a parent paid and is the beneficiary (${h.src('td_tax', 'TreasuryDirect')}). When a bond is reissued to a new owner, the old owner reports the interest earned until the reissue and the new owner only what comes after. Spouses in a community property state who file separately each report half.</p>

<h2>State tax and other taxes</h2>
<p>No state or locality may tax the interest (${h.src('usc_3124', '31 U.S.C. 3124')}). Since it is in your federal adjusted gross income, most state returns have a line to subtract it. The exemption does not cover estate and gift taxes: a bond is part of an estate for federal estate tax and for any state estate or inheritance tax. For a heir, the ${h.a('inherited-savings-bonds', 'inherited bonds page')} explains who reports interest earned before and after the owner's death.</p>

<h2>Paying no tax at all</h2>
<p>Interest on EE bonds issued after 1989 and on I bonds can be excluded from income when it pays for tuition and fees, or is put into a 529 plan or a Coverdell account, in the same year, subject to an income limit (${h.src('irs_p970', 'IRS Publication 970')}). The bonds must be in the name of an owner aged 24 or more when they were issued. The ${h.a('savings-bonds-for-education', 'education page')} computes the exclusion with Form 8815. To compare a savings bond's after-tax yield with a CD's, see ${h.a('t-bill-state-tax', 'the state tax-equivalent page')}.</p>`,
  tool: 'bondtax',
  related: ['cash-savings-bonds', 'savings-bonds-for-education', 'inherited-savings-bonds', 't-bill-state-tax'],
  sources: ['td_tax', 'irs_p550', 'irs_rp_2025_32', 'irs_p970', 'usc_3124'],
});
