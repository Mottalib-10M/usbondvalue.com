import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B = K.P.bonds;
const L = B.annualLimitElectronicI, LE = B.annualLimitElectronicEE;
const W = K.R.i.windows[K.R.i.windows.length - 1];
const iNow = K.composite(W.fixed, W.inflation);
// Worked case: a couple with two children, both series, one calendar year.
const family = K.tool('limit', { pp: 2, kids: 2, ent: 0 });
const withTrust = K.tool('limit', { pp: 2, kids: 0, ent: 1 });

export default defineGuide({
  id: 'i-bond-limit',
  group: 'ibond',
  order: 70,
  slug: 'i-bond-limit',
  nav: 'I bond purchase limit',
  card: `${K.usd(L)} of I bonds a year per Social Security number, and who else counts`,
  title: 'I Bond Limit 2026: $10,000 a Year per Person, Gifts, US',
  description: `I bond limit in 2026: ${K.usd(L)} of electronic I bonds per Social Security number each calendar year, plus ${K.usd(LE)} of EE. How gifts, children and trusts count.`,
  h1: 'How many I bonds can you buy in a year?',
  intro: `Each Social Security number or employer identification number can buy ${K.usd(L)} of electronic I bonds and ${K.usd(LE)} of electronic EE bonds per calendar year. There is no cap on how much you can own.`,
  resume: `The purchase limit for Series I savings bonds is ${K.usd(L)} of electronic bonds per calendar year, counted by the Social Security number of the first person named on the bond, or by the employer identification number of a trust, estate or business. EE bonds have their own, separate limit of ${K.usd(LE)}, so one person can put ${K.usd(L + LE)} a year into savings bonds. The limit applies to purchases, not to holdings: there is no ceiling on the total you can own, and converting paper bonds to electronic ones does not count. Bonds bought for a child count against the child's own limit, and a gift counts against the recipient's limit in the year it is delivered, not the year it was bought. A couple with two children can therefore buy ${family.value} of savings bonds in one year, half of it in I bonds earning ${K.pct(iNow)} for the first six months if bought before November. Paper I bonds bought with a federal tax refund, which used to come on top of that limit, have not been offered since January 1, 2025.`,
  faqs: [
    { q: 'Is the I bond limit per person or per account?', a: `Per Social Security number or employer identification number, for each calendar year. One person with an individual TreasuryDirect account and an entity account that uses the same Social Security number, such as a sole proprietorship, can buy up to ${K.usd(L)} of I bonds in each of the two accounts, according to TreasuryDirect.` },
    { q: 'Do co-owned I bonds count against both owners?', a: 'No. Only the first named owner uses up limit. If your name is second on a co-owned bond, it counts against the limit of the person named first, not yours. Bonds where you are the beneficiary, not an owner, never count against your limit either.' },
    { q: 'Can I buy more I bonds by giving them as gifts?', a: `A gift bond counts against the recipient's limit in the year it is delivered to their account. You can buy it now, keep it in your gift box and deliver it in a later year, when that year's ${K.usd(L)} limit of the recipient applies. The recipient needs a TreasuryDirect account, and you need their name, Social Security number and account number.` },
    { q: 'Does converting paper I bonds use up the yearly limit?', a: 'No. Converting paper EE or I bonds into electronic bonds in TreasuryDirect changes where the bonds are kept, not how many you own, so there is no limit on conversions and they do not reduce what you can buy in the same year.' },
  ],
  body: (h) => `
<h2>The rule, as the Treasury counts it</h2>
<p>TreasuryDirect states the limit in one line: a given Social Security number or employer identification number can buy up to ${K.usd(LE)} in electronic EE bonds and ${K.usd(L)} in electronic I bonds each calendar year (${h.src('td_limits', 'TreasuryDirect, how much can I spend')}). The count follows the first name on the bond. A purchase dated in December counts for that year; one dated January 1 starts the new year's limit, which is why some savers buy at the very end of one year and again at the start of the next.</p>
<p>What the limit does not cover is just as useful. It does not cap holdings: someone who bought the maximum every year since 1998 owns every one of those bonds. It does not include interest. It does not include bonds converted from paper, bonds you inherit or bonds reissued to you from an estate, because none of those are purchases.</p>
${h.mini('limit', { t: 'Yearly savings bond limit for your household', p: ['pp', 'kids'], d: { pp: 1, kids: 1 } })}

<h2>Children, gifts and the gift box</h2>
<p>A child has a Social Security number and therefore a limit of their own. In TreasuryDirect a parent or other adult opens a linked account for a child under 18; bonds in that linked account belong to the child and count against the child's ${K.usd(L)}, whoever paid for them. A gift works the same way. You buy the bond in your account with the recipient's name and Social Security number, hold it for at least five business days in a separate area called the gift box, then deliver it to the recipient's account (${h.src('td_gift', 'TreasuryDirect, giving savings bonds')}). It counts against the recipient's limit in the year of delivery.</p>
<p>That timing creates room. A bond bought for a spouse in 2026 and kept in the gift box can be delivered in 2027 and count for 2027, but its issue date stays the 2026 purchase month, with that month's fixed rate. The bond belongs to the recipient from the start, so you cannot take it back or cash it yourself.</p>

<h2>Co-owned bonds and the first name</h2>
<p>A savings bond can have two owners. For the limit, only the person named first counts: if you buy a bond with your name first and your partner's second, it uses ${K.usd(L)} of your limit and none of theirs. To use both limits, each person buys bonds with their own name first, and may add the other as second owner. A beneficiary, the person who receives the bond at the owner's death, never uses any limit, which is why a parent can name a child as beneficiary on bonds bought within the parent's own limit.</p>

<h2>Trusts, estates and businesses</h2>
<p>An entity with its own employer identification number has its own limit. A revocable living trust, a business or an estate can open an entity account in TreasuryDirect and buy ${K.usd(L)} of I bonds and ${K.usd(LE)} of EE bonds a year in that account. For two spouses and one trust, the total comes to ${withTrust.value} a year. The bonds then belong to the entity, which matters for who reports the interest and for what happens when the trust or business ends.</p>

<h2>The tax refund route is closed</h2>
<p>Until the end of 2024, part of a federal tax refund could be taken as paper I bonds, outside the electronic limit. TreasuryDirect now states that as of January 1, 2025, I bonds are only available electronically (${h.src('td_ibonds', 'TreasuryDirect, I bonds')}), so the electronic limit is the only one left. Paper bonds bought that way earlier keep earning interest on the same rules as other I bonds; their value is on the ${h.a('paper-savings-bonds', 'paper bonds page')}.</p>

<h2>How much one limit is worth</h2>
<p>At the composite rate of ${K.pct(iNow)} for bonds bought from May to October 2026, a full year's ${K.usd(L)} would earn about ${K.usd2(L * iNow / 2)} in its first six months if that rate held for the whole half-year, and the rate changes every six months after that. Interest is added monthly, cannot be withdrawn before 12 months, and costs three months of interest if the bond is cashed before five years. The ${h.a('i-bonds', 'I bonds page')} explains each of those rules, and ${h.a('i-bonds-vs-ee-bonds', 'the comparison with EE bonds')} shows what the second ${K.usd(LE)} would earn instead.</p>`,
  tool: 'limit',
  related: ['i-bonds', 'i-bonds-vs-ee-bonds', 'i-bond-rates', 'ee-bonds'],
  sources: ['td_limits', 'td_gift', 'td_ibonds', 'td_buy'],
});
