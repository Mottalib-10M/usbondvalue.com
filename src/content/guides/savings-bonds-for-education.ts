import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const E = K.P.education;
const X = E.p970Example;
const ph = E.phaseOut['2026'], ph25 = E.phaseOut['2025'];
const ex = K.edu(X.proceeds, X.interest, X.expenses, X.magi, 'joint');
// The Publication 970 case at several incomes, joint return, 2026 limits.
const steps = [ph.joint[0] - 10000, ph.joint[0], Math.round((ph.joint[0] + ph.joint[1]) / 2), ph.joint[1] - 5000, ph.joint[1]];
const rows = steps.map((m) => { const r = K.edu(X.proceeds, X.interest, X.expenses, m, 'joint'); return [K.usd(m), K.pct(r.phase, 1), K.usd2(r.excluded), K.usd2(X.interest - r.excluded)]; });
// Federal tax saved at a 22 % bracket on the full Publication 970 exclusion.
const f = K.fed(X.magi - K.P.tax.standardDeduction.joint, 'joint');
// A bond that would qualify: $5,000 electronic EE bond bought in January 2012 by a parent, cashed this month.
const b = K.bond('EE', '2012-01', K.BUILD, 'electronic', 5000);

export default defineGuide({
  id: 'savings-bonds-for-education',
  group: 'tax',
  order: 30,
  slug: 'savings-bonds-for-education',
  nav: 'Savings bonds for education',
  card: 'The Form 8815 exclusion, its income limit and its conditions',
  title: 'Savings Bonds for Education 2026: Tax-Free Interest, US',
  description: `Savings bonds for education in 2026: EE and I bond interest is tax-free for tuition if income is under ${K.usd(ph.other[1])}, or ${K.usd(ph.joint[1])} for couples. Check your exclusion.`,
  h1: 'Savings bonds for education: the tax-free interest rule',
  intro: `Interest on EE and I bonds can escape federal tax when the bonds are cashed to pay college tuition in the same year. The calculator applies Form 8815 to your amounts and to the 2026 income limits.`,
  resume: `The education savings bond program lets you exclude savings bond interest from federal income when you cash qualified bonds and pay qualified higher education expenses in the same year. Qualified bonds are EE bonds issued after 1989 and I bonds, registered to an owner who was at least ${E.minOwnerAge} before the issue date, alone or with a spouse; a bond in a child's name does not qualify. Expenses are tuition and required fees for you, your spouse or a dependent, or contributions to a 529 plan or a Coverdell account, minus scholarships and other tax-free aid. The excluded share is the interest × expenses ÷ amount cashed. In the IRS example, a couple cash ${K.usd(X.proceeds)} of bonds, including ${K.usd(X.interest)} of interest, and pay ${K.usd(X.expenses)} of tuition: ${K.usd(ex.excluded)} of interest is tax-free. For 2026 the exclusion shrinks when modified AGI goes above ${K.usd(ph.other[0])}, or ${K.usd(ph.joint[0])} on a joint return, and disappears at ${K.usd(ph.other[1])} and ${K.usd(ph.joint[1])}. Married couples filing separately cannot use it.`,
  faqs: [
    { q: 'Can I use savings bonds in my child’s name for college tax-free?', a: `No. The bond must be registered to someone who was at least ${E.minOwnerAge} before its issue date, which rules out bonds bought in a young child's name even years later. Parents who want the exclusion register the bonds to themselves, alone or as spouses, and may name the child as beneficiary.` },
    { q: 'Can I roll savings bonds into a 529 plan tax-free?', a: 'Yes, if the conditions are met. Contributions to a 529 plan or a Coverdell account count as qualified expenses for the year, so cashing qualified bonds and putting the proceeds in a 529 for yourself, your spouse or a dependent can make the interest tax-free, within the income limit. The contribution must be in the same year as the redemption.' },
    { q: 'What expenses do not count for the education exclusion?', a: 'Room and board do not count, nor courses in sports, games or hobbies outside a degree or certificate program. Expenses must also be reduced by tax-free scholarships, Pell grants, employer or veterans’ education aid, tax-free 529 or Coverdell withdrawals, and any expenses used for the American opportunity or lifetime learning credit.' },
  ],
  body: (h) => `
<h2>The four conditions</h2>
<p>TreasuryDirect lists them (${h.src('td_education', 'TreasuryDirect, using bonds for higher education')}) and Publication 970, chapter 9, gives the detail (${h.src('irs_p970', 'IRS Publication 970')}). First, the bonds: Series EE issued after 1989 or Series I, owned by you or by you and your spouse, and you were at least ${E.minOwnerAge} before the issue date. Second, the expenses: tuition and required fees at an eligible institution, or contributions to a 529 plan or a Coverdell account, for you, your spouse or a dependent, paid in the year you cash the bonds. Third, income: modified AGI below the limit for the year. Fourth, filing status: any status except married filing separately. You claim the exclusion on Form 8815, attached to your return (${h.src('irs_f8815', 'IRS Form 8815')}).</p>

<h2>How the excluded amount is figured</h2>
<p>If what you receive from the bonds during the year, principal and interest together, is no more than your adjusted qualified expenses, all the interest can be excluded. If it is more, only part is: the interest is multiplied by adjusted expenses ÷ proceeds. In the Publication 970 example, ${K.usd(X.interest)} × ${K.usd(X.expenses)} ÷ ${K.usd(X.proceeds)} = ${K.usd(ex.excluded)} tax-free and ${K.usd(X.interest - ex.excluded)} taxable. The couple's MAGI of ${K.usd(X.magi)} is below the limit, so no phase-out applies. At their federal rate of ${K.pct(f, 0)}, the exclusion saves about ${K.usd(ex.excluded * f)}.</p>
${h.mini('edu', { t: 'Your own exclusion', p: ['pr', 'int', 'ex'], d: { pr: 20000, int: 8400, ex: 14500, magi: 125000, st: 'joint' } })}

<h2>The income limit for 2026</h2>
<p>The exclusion is reduced in proportion as modified AGI moves through the phase-out range, and lost above it. For 2026 the range is ${K.usd(ph.other[0])} to ${K.usd(ph.other[1])} for single filers and heads of household, and ${K.usd(ph.joint[0])} to ${K.usd(ph.joint[1])} on a joint return, against ${K.usd(ph25.other[0])} to ${K.usd(ph25.other[1])} and ${K.usd(ph25.joint[0])} to ${K.usd(ph25.joint[1])} for 2025. The table runs the Publication 970 case through the 2026 joint range.</p>
${h.table(['Modified AGI (joint)', 'Reduction', 'Interest excluded', 'Interest taxed'], rows, `Proceeds ${K.usd(X.proceeds)}, interest ${K.usd(X.interest)}, adjusted expenses ${K.usd(X.expenses)}. 2026 phase-out range.`, ['r', 'r', 'r', 'r'])}
<p>Modified AGI here is your adjusted gross income before the exclusion, with a few items added back: foreign earned income and housing exclusions, the exclusions for residents of American Samoa and Puerto Rico, employer adoption benefits and the student loan interest deduction. The bond interest itself is included, so cashing a large amount can push MAGI into the phase-out. The worksheet in the Form 8815 instructions computes it.</p>

<h2>What reduces the expenses</h2>
<p>Qualified expenses are reduced by the tax-free part of scholarships and grants, including Pell grants, by expenses used for tax-free 529 or Coverdell withdrawals, by veterans' education benefits, tuition reductions and employer-provided education aid, and by any expense used to claim the American opportunity or lifetime learning credit. Gifts and inheritances do not reduce them. An eligible institution is any college, university, vocational school or other postsecondary school that can take part in the Department of Education's student aid programs, which includes nearly all accredited ones and some schools abroad; the school can confirm it. The same dollar of tuition cannot be used twice: a family claiming the American opportunity credit on part of the tuition can use only the rest for the bond exclusion.</p>

<h2>Planning the bonds</h2>
<p>A ${K.usd(5000)} electronic EE bond bought in January 2012 by a parent is worth ${b.ok ? K.usd2(b.value!) : 'n/a'} on the first of ${K.month(K.BUILD)}, with ${b.ok ? K.usd2(b.interest!) : 'n/a'} of interest. That interest is the part that can become tax-free. The exclusion applies only to interest not yet taxed, which is why Publication 550 points owners planning it toward method 1, reporting in the year the bond is cashed: an owner who reports savings bond interest every year has little left to exclude. The bonds also have to be cashed in a year when expenses are paid and income is under the limit, which may not be the year the bonds would otherwise be cashed. The ${h.a('ee-bond-doubling', 'EE doubling page')} shows when an EE bond reaches twice its price, and the ${h.a('savings-bond-taxes', 'tax page')} explains the two reporting methods.</p>

<h2>State tax</h2>
<p>The exclusion is a federal one. Savings bond interest is exempt from state and local income tax in any case (${h.src('usc_3124', '31 U.S.C. 3124')}), whether or not it pays for college, so the program changes nothing on the state return. For other ways of cashing the bonds, see the ${h.a('cash-savings-bonds', 'cashing page')}.</p>`,
  tool: 'edu',
  related: ['savings-bond-taxes', 'cash-savings-bonds', 'ee-bond-doubling', 'i-bonds'],
  sources: ['td_education', 'irs_p970', 'irs_f8815', 'usc_3124'],
});
