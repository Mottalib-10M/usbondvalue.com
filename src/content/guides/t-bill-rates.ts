import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const T = K.TERMS;
const L = (t: string) => K.bill(t);
const days = K.P.tbills.termDays as Record<string, number>;
const sorted = [...T].sort((a, b) => L(b).investment - L(a).investment);
const hi = sorted[0], lo = sorted[sorted.length - 1];
const b26 = L('26-Week'), b4 = L('4-Week'), b13 = L('13-Week'), b52 = L('52-Week');
const rows = T.map((t) => [K.termLabel(t), K.day(L(t).auction), K.pct(L(t).discount / 100, 3), `<strong>${K.pct(L(t).investment / 100, 3)}</strong>`, K.dec(L(t).price, 6), K.usd2(Math.round(10000 * L(t).price) / 100)]);
const up = (K.A.upcoming as Array<{ term: string; auction: string; issue: string; maturity: string; offering: number }>).slice().sort((a, b) => a.auction.localeCompare(b.auction));
const upText = up.map((u) => `${K.termLabel(u.term)} on ${K.day(u.auction)}`).join(', ');
// Gap between the investment rate and the discount rate on the 26-week bill, in percentage points.
const gap26 = (b26.investment - b26.discount) / 100;
const interest26 = 10000 - Math.round(10000 * b26.price) / 100;

export default defineGuide({
  id: 't-bill-rates',
  group: 'tbill',
  order: 10,
  slug: 't-bill-rates',
  nav: 'T-bill rates',
  card: 'Latest auction rate of every Treasury bill term',
  title: 'T-Bill Rates 2026: Latest Treasury Auction Results, US',
  description: `T-bill rates from the latest Treasury auctions (${K.month(b26.auction.slice(0, 7))}): 26-week ${K.pct(b26.investment / 100, 3)}, 4-week ${K.pct(b4.investment / 100, 3)}, 52-week ${K.pct(b52.investment / 100, 3)}. Price, yield and cost of each bill term.`,
  h1: 'T-bill rates at the latest Treasury auctions',
  intro: `Treasury bill rates are set at auction each week. The latest results: ${T.map((t) => `${K.termLabel(t)} ${K.pct(L(t).investment / 100, 3)}`).join(', ')}, as investment rates.`,
  resume: `Treasury bill rates come from the weekly auctions the Treasury holds for each term, and two numbers describe each result. The discount rate sets the price: a 26-week bill auctioned on ${K.day(b26.auction)} at ${K.pct(b26.discount / 100, 3)} sold for ${K.dec(b26.price, 6)} per ${K.usd(100)}, so ${K.usd(10000)} of face value cost ${K.usd2(10000 - interest26)} and pays back ${K.usd(10000)} on ${K.day(b26.maturity)}. The investment rate, also called the bond-equivalent yield, turns that gain into an annual rate on the money actually paid: ${K.pct(b26.investment / 100, 3)}. It is the figure to compare with a savings account or a CD. At the latest auctions the highest investment rate was on the ${K.termLabel(hi)} bill, ${K.pct(L(hi).investment / 100, 3)}, and the lowest on the ${K.termLabel(lo)} bill, ${K.pct(L(lo).investment / 100, 3)}. Bill interest is subject to federal income tax and exempt from state and local income tax. Figures are read from the Treasury's auction data on Fiscal Data, last on ${K.day(K.A.built)}.`,
  faqs: [
    { q: 'What is the difference between the discount rate and the investment rate of a T-bill?', a: `The discount rate is computed on the face value with a 360-day year and fixes the price. The investment rate is computed on the price you pay with a 365-day year, so it is always higher: on the latest 26-week bill, ${K.pct(gap26, 3)} more. Use the investment rate to compare a bill with a savings account, a CD or an I bond.` },
    { q: 'How often are T-bill rates set?', a: 'At every auction. The 4, 6, 8, 13, 17 and 26-week bills are auctioned every week and the 52-week bill every four weeks, according to TreasuryDirect. Each auction sets one rate for all bills of that issue, the highest accepted competitive bid, which noncompetitive buyers also receive.' },
    { q: 'Do I get the auction rate if I buy a T-bill in TreasuryDirect?', a: 'Yes. A purchase in TreasuryDirect is a noncompetitive bid: you state the amount, not a rate, and you receive the rate set by the competitive bidders at that auction, up to 10 million dollars per auction. You know the exact price only after the auction closes.' },
  ],
  body: (h) => `
<h2>Latest result of each term</h2>
${h.table(['Term', 'Auction', 'Discount rate', 'Investment rate', 'Price per $100', `Cost of ${K.usd(10000)}`], rows, `Treasury bill auctions, high rates accepted. Source: Fiscal Data, Treasury securities auctions data, read ${K.day(K.A.built)}.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>The cost column is what ${K.usd(10000)} of face value cost at each auction. The difference with ${K.usd(10000)} is the interest, paid at maturity. A 4-week bill earns about a month of interest, a 52-week bill a year's: on the latest auctions ${K.usd2(10000 - Math.round(10000 * b4.price) / 100)} and ${K.usd2(10000 - Math.round(10000 * b52.price) / 100)}.</p>

<h2>Reading the two rates</h2>
<p>The Treasury explains both on its pricing page (${h.src('td_pricing', 'TreasuryDirect, understanding pricing')}). The discount rate is the gain divided by the face value, scaled to a 360-day year: on the 13-week bill of ${K.day(b13.auction)}, a ${K.usd2(100 - b13.price)} gain per ${K.usd(100)} over ${days['13-Week']} days gives ${K.pct(b13.discount / 100, 3)}. The investment rate divides the same gain by the price instead of the face value and uses a 365-day year, or 366 when a February 29 falls within the year after issue: ${K.pct(b13.investment / 100, 3)}. For the 52-week bill the investment rate uses a formula that accounts for semiannual compounding, so it can be compared with Treasury notes. The ${h.a('t-bill-calculator', 'T-bill calculator')} applies both formulas to any discount rate.</p>
${h.mini('tbill', { t: 'Cost and interest for another term', p: ['tm', 'face'], d: { tm: '8-Week', face: 25000 } })}

<h2>How terms compare at the latest auctions</h2>
<p>Longer bills do not always pay more. At the latest auctions the order from highest to lowest investment rate was ${sorted.map((t) => K.termLabel(t)).join(', ')}. The spread between the top and the bottom was ${K.pct((L(hi).investment - L(lo).investment) / 100, 3)}. Rates of different terms reflect what the market expects short-term rates to do over each period; a higher 52-week rate than 4-week rate means buyers asked more to lock money for a year. Each auction is a single price, and the next one can move in either direction.</p>
<p>The ${h.a('treasury-bill-rates', 'Treasury bill rate history')} page lays the auctions of the past year side by side, month by month, for four terms.</p>

<h2>Who sets the rate</h2>
<p>Banks, dealers and large investors submit competitive bids that name a discount rate; individuals in TreasuryDirect submit noncompetitive bids that name only an amount. The Treasury accepts the noncompetitive bids first, then competitive bids from the lowest rate up until the offering is filled. The highest rate accepted becomes the rate for everyone in that auction, which is why the tables on this page show a single figure per auction. TreasuryDirect caps a noncompetitive purchase at ${K.usd(K.P.tbills.maxNoncompetitive)} per auction and allows any multiple of ${K.usd(K.P.tbills.increment)} from ${K.usd(K.P.tbills.minimum)} (${h.src('td_tbills', 'TreasuryDirect, Treasury bills')}).</p>

<h2>Next auctions</h2>
<p>${up.length ? `The auctions already announced and not yet held, at the time the site was built, are: ${upText}. Announcements usually come a few days before each auction, with the amount offered and the issue and maturity dates.` : 'No auction was announced and pending when the site was built.'} Results appear on TreasuryDirect the day of the auction and on Fiscal Data soon after; the site reads them when it is rebuilt.</p>

<h2>Bill rates next to savings bonds</h2>
<p>A bill and a savings bond answer different needs, and their rates are not set the same way. A bill's rate is fixed for its term only, from four weeks to a year, and whoever wants to keep the money in bills rolls it into a new auction at whatever rate that auction gives. An I bond's rate is reset every six months from inflation and the bond can run for 30 years, but it cannot be cashed during the first year and loses three months of interest before five. An EE bond pays a fixed rate of ${K.pct(K.R.eeCurrent)} and doubles at 20 years. On the latest figures, the ${K.termLabel(hi)} bill paid ${K.pct(L(hi).investment / 100, 3)} and new I bonds earn ${K.pct(K.composite(K.R.i.windows[K.R.i.windows.length - 1].fixed, K.R.i.windows[K.R.i.windows.length - 1].inflation))} until the end of October 2026. Both are exempt from state income tax.</p>

<h2>Tax on bill interest</h2>
<p>The gain on a bill is interest for federal tax and is reported in the year the bill matures, or in the year you sell it. It is exempt from state and local income tax (${h.src('usc_3124', '31 U.S.C. 3124')}), which is worth more where state rates are high: the ${h.a('t-bill-state-tax', 'state tax page')} converts each bill rate into the yield a taxable account would need in each state, and ${h.a('t-bill-vs-cd', 'T-bill versus CD')} runs the comparison for one household. Savings bonds share the same exemption; their rates are on the ${h.a('i-bond-rates', 'I bond rates page')}.</p>`,
  tool: 'tbill',
  toolArg: { tm: '26-Week' },
  related: ['treasury-bill-rates', 't-bill-calculator', 't-bill-state-tax', 'treasury-bills', 't-bill-vs-cd'],
  sources: ['fd_auctions', 'td_tbills', 'td_pricing', 'usc_3124'],
});
