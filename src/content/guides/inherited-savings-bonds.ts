import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B = K.P.bonds;
const U = K.P.tax.p550Decedent;
const before = U.valueAtDeath - U.price, after = U.valueCashed - U.valueAtDeath;
// A bond inherited today: $1,000 face paper EE bond issued in June 2001 by the late owner.
const issue = '2001-06';
const now = K.bond('EE', issue, K.BUILD, 'paper', 1000);
// Same bond valued two years earlier, as if the owner had died then.
const shift = (m: string, k: number) => { const [y, mo] = m.split('-').map(Number); const n = y * 12 + mo - 1 + k; return `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`; };
const deathM = shift(K.BUILD, -24);
const atDeath = K.bond('EE', issue, deathM, 'paper', 1000);
const finalM = shift(issue, B.finalMaturityMonths);
// Heir's federal tax on all the interest at a 22 % or 24 % rate, single filer with $70,000 of other income.
const heirInt = now.ok ? now.interest! : 0;
const heirTax = K.fedTax(70000 + heirInt, 'single') - K.fedTax(70000, 'single');

export default defineGuide({
  id: 'inherited-savings-bonds',
  group: 'tax',
  order: 40,
  slug: 'inherited-savings-bonds',
  nav: 'Inherited savings bonds',
  card: 'Who owns them, how to cash them, who pays the tax',
  title: 'Inherited Savings Bonds 2026: Cashing and Tax Rules, US',
  description: `Inherited savings bonds in 2026: who owns the bond after a death, the ${K.usd(B.estateCourtThreshold)} court rule, and who reports the interest earned before and after death.`,
  h1: 'Inherited savings bonds: ownership, cashing and tax',
  intro: `When a savings bond owner dies, the bond goes to a surviving co-owner or beneficiary, or else to the estate. The tax on interest earned before death falls on the final return or on the heir, as the calculator shows.`,
  resume: `An inherited savings bond follows the names on it. If a co-owner or a beneficiary survives, the bond is theirs directly and does not pass through the estate. If the only person named has died, or both co-owners, the bond belongs to the estate of the last to die, and is distributed under the will or state law; when the Treasury securities in an estate are worth more than ${K.usd(B.estateCourtThreshold)} at the date of death, a court must administer it. For tax, the interest earned before death can go on the owner's final federal return, at the choice of the executor or surviving spouse; if it does not, the heir reports it together with the interest earned after death, when the bond is cashed. In the IRS example, a bond bought for ${K.usd(U.price)} is worth ${K.usd(U.valueAtDeath)} at death and cashed at ${K.usd(U.valueCashed)}: the heir reports ${K.usd(before + after)}, or only ${K.usd(after)} if ${K.usd(before)} went on the final return. Either way the interest is exempt from state income tax.`,
  faqs: [
    { q: 'Do I pay tax on an inherited savings bond?', a: `On the interest, yes, at the federal level only. You report the interest earned after the owner's death, plus the interest earned before it unless the executor put that part on the owner's final return. If federal estate tax was paid on the bond, you may deduct the estate tax attributable to that interest.` },
    { q: 'How do I cash a savings bond of someone who died?', a: 'It depends on the names on the bond. A surviving co-owner or beneficiary can cash it or have it reissued, following the Treasury’s instructions for named survivors. Without one, the estate’s representative, or the heirs of a small estate not going through court, follow the estate procedures on TreasuryDirect. For electronic bonds, contact the Treasury, which holds the account.' },
    { q: 'Does an inherited bond keep earning interest?', a: `Yes, until its final maturity, 30 years after issue for EE and I bonds. The death changes the owner, not the bond: it keeps its issue date, rate and penalty dates. A bond that has already reached 30 years earns nothing more, and its interest is taxable for the year of final maturity.` },
  ],
  body: (h) => `
<h2>Who owns the bond after a death</h2>
<p>TreasuryDirect sets out three situations for paper bonds (${h.src('td_death', 'TreasuryDirect, death of a savings bond owner')}). With one person named, the bond belongs to that person's estate. With two co-owners, the survivor becomes owner as if they had been the only owner from the issue date; if both have died, the bond goes to the estate of the one who died last. With a beneficiary named, the bond goes directly to the beneficiary and stays out of the estate. For electronic bonds, the Treasury asks the family to contact it: it puts a hold on the deceased's TreasuryDirect account and says what to send.</p>
<p>An estate holding savings bonds and other Treasury securities worth more than ${K.usd(B.estateCourtThreshold)} in redemption value at the date of death must be administered by a court, and the court-appointed representative deals with the bonds. Below that amount, an estate not settled through a court or under a state small-estate procedure follows the Treasury's procedure for non-administered estates.</p>

<h2>The value on the date of death</h2>
<p>The tax split needs the bond's value at death, which is the redemption value of that month. Take a ${K.usd(1000)} paper EE bond issued in ${K.month(issue)}, bought for ${now.ok ? K.usd2(now.price!) : 'n/a'}. Had its owner died in ${K.month(deathM)}, its value then was ${atDeath.ok ? K.usd2(atDeath.value!) : 'n/a'}; cashed on the first of ${K.month(K.BUILD)}, it pays ${now.ok ? K.usd2(now.value!) : 'n/a'}. Interest before death is ${atDeath.ok ? K.usd2(atDeath.interest!) : 'n/a'}, after death ${atDeath.ok && now.ok ? K.usd2(now.value! - atDeath.value!) : 'n/a'}. The bond stops earning in ${K.month(finalM)}.</p>
${h.mini('bond', { t: 'Value of the bond on the date of death', p: ['sr', 'iy', 'am', 'ay'], d: { sr: 'I', fm: 'paper', iy: 2003, im: 9, amt: 1000, am: 3, ay: 2025 } })}

<h2>Who reports the interest</h2>
<p>Publication 550 distinguishes two cases (${h.src('irs_p550', 'IRS Publication 550')}). If the owner reported the interest each year, the interest of the year of death up to the date of death goes on the final return, and the heir reports only what is earned afterwards. If the owner deferred, which is the usual case, the executor or surviving spouse who files the final return may include on it all the interest earned before death; the heir then reports only the later interest. If they do not, the interest earned before death is income in respect of a decedent: it stays off the final return, and the heir reports all of it, before and after death, when the bond is cashed or reaches final maturity.</p>
<p>The publication's example is a ${K.usd(U.face)} EE bond bought for ${K.usd(U.price)}, worth ${K.usd(U.valueAtDeath)} at the owner's death, cashed by the heir at ${K.usd(U.valueCashed)}. Without the election, the heir reports ${K.usd(before + after)}; with it, ${K.usd(after)}, and ${K.usd(before)} is on the final return. An heir who already reports savings bond interest every year includes the ${K.usd(before)} in the year the bond is acquired.</p>

<h2>Which choice costs less</h2>
<p>The election moves tax from the heir to the deceased's final return, so the answer depends on the two tax rates. Putting the interest on the final return helps when the deceased was in a lower bracket than the heir, for example in a year with only part of a year's income. Leaving it to the heir helps when the heir is in a lower bracket or will cash the bonds over several years. For the ${K.usd(1000)} bond above cashed now, a single heir with ${K.usd(70000)} of other taxable income would owe ${K.usd(heirTax)} of federal tax on the whole ${now.ok ? K.usd2(heirInt) : 'n/a'} of interest. The calculator splits any bond's interest between the two returns.</p>

<h2>Estate tax and the deduction</h2>
<p>A savings bond is part of the deceased's estate for federal estate tax and for any state estate or inheritance tax (${h.src('td_tax', 'TreasuryDirect, tax information')}); the exemption from state tax covers income tax only. When federal estate tax was paid on the value of a bond, the heir who reports the interest earned before death can deduct the part of that estate tax attributable to it, as an itemized deduction, under the rules for income in respect of a decedent. Most estates owe no federal estate tax, and then there is nothing to deduct.</p>

<h2>Practical steps</h2>
<p>Find every bond first: paper bonds may be among the deceased's papers, and electronic ones are in a TreasuryDirect account. Check whether each one is still earning; a bond past 30 years has a fixed value and its interest was taxable for the year it matured. A named co-owner or beneficiary can usually cash the bond or have it reissued. Heirs who keep the bonds take over the same issue dates, so the 12-month lock and the three-month penalty before five years run from the original issue date. The ${h.a('cash-savings-bonds', 'cashing page')} explains the forms and the ${h.a('savings-bond-taxes', 'tax page')} the reporting methods.</p>`,
  tool: 'inherit',
  related: ['savings-bond-taxes', 'cash-savings-bonds', 'matured-savings-bonds', 'savings-bond-value'],
  sources: ['td_death', 'irs_p550', 'td_tax', 'td_cashing'],
});
