import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const TB = K.P.tbills;
const b4 = K.bill('4-Week'), b26 = K.bill('26-Week'), b52 = K.bill('52-Week');
// Worked case: $5,000 of 4-week bills at the latest auction.
const face = 5000;
const cost4 = Math.round(face * b4.price) / 100;
const yearsOf4 = 13; // 4-week bills in a year, rolled back to back (52 weeks ÷ 4)
const fed = K.P.tax.brackets.single[2][1];

export default defineGuide({
  id: 'treasury-bills',
  group: 'tbill',
  order: 30,
  slug: 'treasury-bills',
  nav: 'Treasury bills explained',
  card: 'How T-bills are sold, priced, paid and taxed',
  title: 'Treasury Bills 2026: How T-Bills Work, Buying and Tax, US',
  description: `Treasury bills in 2026: sold at a discount from ${K.usd(TB.minimum)}, paid at face value in 4 to 52 weeks, ${K.pct(b26.investment / 100, 3)} on the latest 26-week bill, no state tax. How buying works.`,
  h1: 'Treasury bills: how T-bills are bought, paid and taxed',
  intro: `A Treasury bill is a loan of 4 to 52 weeks to the U.S. government, bought below face value and repaid at face value. It pays no coupon; the discount is the interest.`,
  resume: `A Treasury bill is the shortest security the U.S. Treasury sells: terms of ${TB.terms.map((t) => t.replace('-Week', '')).join(', ')} weeks, sold at auction at a price below its face value and repaid at face value on the maturity date. The difference is the interest. You can buy from ${K.usd(TB.minimum)} in multiples of ${K.usd(TB.increment)}, up to ${K.usd(TB.maxNoncompetitive)} per auction with a noncompetitive bid, either in a TreasuryDirect account or through a bank or broker. At the auction of ${K.day(b4.auction)}, ${K.usd(face)} of 4-week bills cost ${K.usd2(cost4)}, for ${K.usd2(face - cost4)} of interest and an investment rate of ${K.pct(b4.investment / 100, 3)}; a 26-week bill paid ${K.pct(b26.investment / 100, 3)} and a 52-week bill ${K.pct(b52.investment / 100, 3)}. The rate is fixed for the term but each new purchase takes the rate of its own auction. Interest is subject to federal income tax in the year the bill matures and exempt from state and local income tax.`,
  faqs: [
    { q: 'What is the minimum to buy a Treasury bill?', a: `${K.usd(TB.minimum)} of face value, then any multiple of ${K.usd(TB.increment)}. You pay less than the face value: at the latest 26-week auction, ${K.usd(TB.minimum)} of face value cost ${K.usd2(b26.price)}. The maximum for a noncompetitive bid, the kind individuals place, is ${K.usd(TB.maxNoncompetitive)} per auction.` },
    { q: 'Can I sell a T-bill before it matures?', a: 'Yes, but not inside TreasuryDirect. A bill held there has to be transferred to a bank or broker, which can sell it on the market at the going price, possibly above or below what you paid. A bill bought through a broker can usually be sold directly. There is no penalty, only the market price of the day.' },
    { q: 'When is T-bill interest taxed?', a: 'In the year the bill matures, or the year you sell it, as ordinary interest on your federal return. A 26-week bill bought in October and repaid in April counts in the following year. The interest is exempt from state and local income tax under federal law, and TreasuryDirect issues a Form 1099-INT.' },
    { q: 'What happens to my money when a T-bill matures?', a: 'The face value is paid to the bank account linked to your TreasuryDirect account, or to your brokerage account, on the maturity date. If you chose to reinvest, TreasuryDirect uses the face value to buy a new bill of the same term at the auction held for that date, and the part of the face value not needed for the new price is paid to your bank account.' },
  ],
  body: (h) => `
<h2>Discount, face value and maturity</h2>
<p>A bill has no interest payments. You pay a price below ${K.usd(100)} per ${K.usd(100)} of face value at the auction, and the Treasury pays the full face value at maturity (${h.src('td_tbills', 'TreasuryDirect, Treasury bills')}). The price comes from the discount rate set at auction: price = 100 × (1 − discount rate × days ÷ 360). For the 4-week bill of ${K.day(b4.auction)}, a discount rate of ${K.pct(b4.discount / 100, 3)} over ${TB.termDays['4-Week']} days gave a price of ${K.dec(b4.price, 6)}. Bills are issued only in electronic form and settle on the issue date, usually a few days after the auction: that bill was issued on ${K.day(b4.issue)} and matures on ${K.day(b4.maturity)}.</p>
${h.mini('tbill', { t: 'What a bill costs at the latest auction', p: ['tm', 'face'], d: { tm: '17-Week', face: 2000 } })}

<h2>The auction calendar</h2>
<p>The Treasury auctions the 4, 6, 8, 13, 17 and 26-week bills every week and the 52-week bill every four weeks. Each auction is announced a few days ahead with the amount offered, and the result, one rate for the whole issue, is published the same day. The ${h.a('t-bill-rates', 'T-bill rates page')} lists the latest result of each term and the auctions already announced; the ${h.a('treasury-bill-rates', 'rate history')} shows a year of results.</p>

<h2>Buying in TreasuryDirect or through a broker</h2>
<p>In TreasuryDirect you place a noncompetitive bid: an amount, no rate. Your bid is filled in full at the rate the auction sets, up to ${K.usd(TB.maxNoncompetitive)}. The money is taken from your bank account on the issue date. You can schedule a purchase before the auction and choose to reinvest automatically at maturity, which buys a new bill of the same term with the face value.</p>
<p>A bank or broker can place the same noncompetitive bid at auction for you, or buy bills already issued on the secondary market at the day's price. Bills held at a broker can be sold before maturity at any time the market is open; bills in TreasuryDirect cannot be sold there and must first be transferred out.</p>

<h2>One purchase from start to finish</h2>
<p>Take the latest 26-week bill. The auction was held on ${K.day(b26.auction)}; a buyer in TreasuryDirect had to place the order before the noncompetitive deadline of that day, without knowing the rate. After the close the result was published: an investment rate of ${K.pct(b26.investment / 100, 3)} and a price of ${K.dec(b26.price, 6)} per ${K.usd(100)}. On the issue date, ${K.day(b26.issue)}, ${K.usd2(Math.round(10000 * b26.price) / 100)} left the buyer's bank account for ${K.usd(10000)} of face value. On ${K.day(b26.maturity)} the ${K.usd(10000)} comes back, unless reinvestment was chosen. Nothing happens in between: no interest is credited, and the account shows the bill at its face value. If the maturity date falls in the next calendar year, so does the tax on the interest.</p>

<h2>Interest in dollars over a year</h2>
<p>Rolling 4-week bills back to back means ${yearsOf4} purchases a year, each at its own auction rate. If every auction matched the latest one, ${K.usd(face)} would earn about ${K.usd2((face - cost4) * yearsOf4)} in a year. A single 52-week bill at ${K.pct(b52.investment / 100, 3)} would earn ${K.usd2(face - Math.round(face * b52.price) / 100)} on the same face value, with one rate locked for the year and no reinvestment work. The ${h.a('t-bill-calculator', 'T-bill calculator')} gives the exact price and yield for any rate and term.</p>

<h2>Tax</h2>
<p>For federal tax, the discount is interest, taxable in the year the bill matures or is sold. In a ${K.pct(fed, 0)} federal bracket, ${K.usd2(face - cost4)} of interest costs ${K.usd2((face - cost4) * fed)}. States and localities cannot tax it (${h.src('usc_3124', '31 U.S.C. 3124')}): on a state return the interest is subtracted from income, usually on a line for interest on U.S. obligations. A bill bought in one year and repaid in the next moves the interest into the next year's return. The ${h.a('t-bill-state-tax', 'state tax page')} shows what the exemption is worth in each state, and the ${h.a('t-bill-vs-cd', 'comparison with a CD')} turns it into a single number for your income.</p>

<h2>Bills, notes and savings bonds</h2>
<p>Bills are the short end of the Treasury's marketable securities: notes run from 2 to 10 years and pay interest every six months, bonds run 20 or 30 years. Savings bonds are a separate family: they are not marketable, cannot be sold to anyone else, and earn a rate set by formula rather than at auction. Their rules are on the ${h.a('i-bonds', 'I bonds page')} and the ${h.a('ee-bonds', 'EE bonds page')}.</p>`,
  tool: 'tbill',
  toolArg: { tm: '4-Week', face: 5000 },
  related: ['t-bill-rates', 't-bill-calculator', 'treasury-bill-rates', 't-bill-vs-cd'],
  sources: ['td_tbills', 'td_pricing', 'fd_auctions', 'usc_3124'],
});
