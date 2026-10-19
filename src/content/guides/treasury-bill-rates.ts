import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

type Row = [string, number, number];
const H = K.A.history as Record<string, Row[]>;
const TERMS4 = ['4-Week', '13-Week', '26-Week', '52-Week'].filter((t) => H[t]?.length);
// Average investment rate of each month's auctions, per term.
const months = [...new Set(Object.values(H).flat().map((r) => r[0].slice(0, 7)))].sort();
const avg = (t: string, m: string) => { const xs = (H[t] ?? []).filter((r) => r[0].startsWith(m)).map((r) => r[1]); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined; };
const rows = months.slice().reverse().map((m) => [K.month(m), ...TERMS4.map((t) => { const a = avg(t, m); return a === undefined ? '' : K.pct(a / 100, 3); })]);
const stat = (t: string) => {
  const r = H[t];
  const hi = r.reduce((a, x) => (x[1] > a[1] ? x : a)), lo = r.reduce((a, x) => (x[1] < a[1] ? x : a));
  return { first: r[0], last: r[r.length - 1], hi, lo, n: r.length };
};
const s13 = stat('13-Week'), s4 = stat('4-Week'), s26 = stat('26-Week'), s52 = stat('52-Week');
const ch = (s: ReturnType<typeof stat>) => (s.last[1] - s.first[1]) / 100;
const dir = (x: number) => (x > 0 ? 'higher' : x < 0 ? 'lower' : 'unchanged');
const statRows = TERMS4.map((t) => { const s = stat(t); return [K.termLabel(t), String(s.n), `${K.pct(s.lo[1] / 100, 3)} (${K.day(s.lo[0])})`, `${K.pct(s.hi[1] / 100, 3)} (${K.day(s.hi[0])})`, K.pct(s.last[1] / 100, 3)]; });
// Spread between the 52-week and the 4-week bill at the start and at the end of the period.
const spread = (m: string) => { const a = avg('52-Week', m), b = avg('4-Week', m); return a !== undefined && b !== undefined ? (a - b) / 100 : undefined; };
const mWith52 = months.filter((m) => avg('52-Week', m) !== undefined);
const sp0 = spread(mWith52[0]), sp1 = spread(mWith52[mWith52.length - 1]);
// Rolling $10,000 in 13-week bills for four quarters from the first auction of the period, against one 52-week bill.
const H13 = H['13-Week'];
const rolls = [0, 13, 26, 39].map((k) => H13[k]).filter(Boolean);
let face = 10000; const rollRows: string[][] = [];
for (const r of rolls) { const price = K.priceFromDiscount(r[2] / 100, 91); const cost = face; const f = Math.round((cost / price) * 100 * 100) / 100; rollRows.push([K.day(r[0]), K.pct(r[1] / 100, 3), K.usd2(cost), K.usd2(f)]); face = f; }
const rollGain = face - 10000;
const first52 = H['52-Week'][0];
const gain52 = 10000 / K.priceFromDiscount(first52[2] / 100, 364) * 100 - 10000;
const other = ['6-Week', '8-Week', '17-Week'].filter((t) => H[t]?.length).map((t) => ({ t, s: stat(t) }));

export default defineGuide({
  id: 'treasury-bill-rates',
  group: 'tbill',
  order: 20,
  slug: 'treasury-bill-rates',
  nav: 'Treasury bill rate history',
  card: 'Bill auction rates month by month over the past year',
  title: 'Treasury Bill Rates 2026: Auction History by Month, US',
  description: `Treasury bill rates in 2026, month by month: average auction yield of the 4, 13, 26 and 52-week bills since ${K.month(months[0])}, with each term's high and low.`,
  h1: 'Treasury bill rates over the past year, auction by auction',
  intro: `Every bill auction since ${K.month(months[0])}, averaged by month for four terms, with the highest and lowest rate of each. The 13-week bill went from ${K.pct(s13.first[1] / 100, 3)} to ${K.pct(s13.last[1] / 100, 3)}.`,
  resume: `Treasury bill rates are set at each auction, so a rate history is a list of auction results. Over the ${s13.n} auctions of the 13-week bill from ${K.day(s13.first[0])} to ${K.day(s13.last[0])}, the investment rate moved from ${K.pct(s13.first[1] / 100, 3)} to ${K.pct(s13.last[1] / 100, 3)}, with a low of ${K.pct(s13.lo[1] / 100, 3)} on ${K.day(s13.lo[0])} and a high of ${K.pct(s13.hi[1] / 100, 3)} on ${K.day(s13.hi[0])}. The 26-week bill ended the period ${dir(ch(s26))} by ${K.pct(Math.abs(ch(s26)), 3)}, the 4-week bill ${dir(ch(s4))} by ${K.pct(Math.abs(ch(s4)), 3)}. The 52-week bill, sold only every four weeks, went from ${K.pct(s52.first[1] / 100, 3)} to ${K.pct(s52.last[1] / 100, 3)}. The table below averages the auctions of each month; the second table gives each term's range. These are investment rates, the yield on the price paid, computed by the Treasury and published on Fiscal Data. Past auction rates say nothing certain about the next auction.`,
  faqs: [
    { q: 'Where does the Treasury publish past T-bill rates?', a: 'Every auction result is in the Treasury securities auctions dataset on Fiscal Data, the Treasury’s open data site, and in the auction query of TreasuryDirect. Each record gives the auction and issue dates, the high discount rate, the investment rate and the price per 100 dollars. This page reads that dataset when the site is built.' },
    { q: 'Why does this table use averages for each month?', a: 'Most bill terms are auctioned every week, so a month holds four or five results. The average of those auctions gives one comparable figure per month and per term. The 52-week bill is auctioned every four weeks, so most months have one result for it and some have none, which is why its column has gaps.' },
    { q: 'Is the investment rate the same as the yield shown on financial websites?', a: 'Not always. Market sites usually quote bills traded between dealers during the day, on a discount or bond-equivalent basis, which moves minute by minute. The investment rate in auction results is the yield of bills bought at that auction and held to maturity, the rate someone buying in TreasuryDirect actually received.' },
  ],
  body: (h) => `
<h2>Average investment rate by month</h2>
${h.table(['Month', ...TERMS4.map((t) => K.termLabel(t))], rows, `Average of the high investment rates of each month's regular bill auctions. Source: Fiscal Data, Treasury securities auctions data, read ${K.day(K.A.built)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>A month's figure for the 13-week bill is the mean of four or five weekly auctions, so it smooths the week-to-week moves that the auction results themselves show. The calculator at the top gives the exact result of the latest auction of any term.</p>

<h2>Range of each term over the period</h2>
${h.table(['Term', 'Auctions', 'Lowest', 'Highest', 'Latest'], statRows, 'Investment rates of individual auctions, with the auction date.', ['l', 'r', 'r', 'r', 'r'])}
<p>The range of a term over a year is the most direct measure of how much a saver who rolls bills can expect the rate to move. On the 13-week bill the gap between the lowest and the highest auction of the period was ${K.pct((s13.hi[1] - s13.lo[1]) / 100, 3)}. On ${K.usd(100000)} kept in 13-week bills for a year, a shift of that size changes the interest by about ${K.usd(100000 * (s13.hi[1] - s13.lo[1]) / 100)} a year.</p>
${h.mini('tbill', { t: 'Cost and interest at the latest 13-week auction', p: ['face'], d: { tm: '13-Week', face: 50000 } })}

<h2>Short bills against the one-year bill</h2>
<p>The difference between the 52-week and the 4-week rate shows how the market priced a one-year commitment against a one-month one. ${sp0 !== undefined && sp1 !== undefined ? `In ${K.month(mWith52[0])} the 52-week bill paid ${K.pct(Math.abs(sp0), 3)} ${sp0 >= 0 ? 'more' : 'less'} than the 4-week bill; in ${K.month(mWith52[mWith52.length - 1])}, ${K.pct(Math.abs(sp1), 3)} ${sp1 >= 0 ? 'more' : 'less'}.` : ''} When the one-year rate is below the one-month rate, buyers are accepting less for a longer lock, which usually means they expect short rates to fall; when it is above, the reverse. Each figure is one auction's price and moves with the next one.</p>
<p>For someone choosing a term, that spread is the price of certainty. A 52-week bill fixes the rate for a year; a 4-week bill rolled twelve times takes twelve different rates. The ${h.a('t-bill-rates', 'latest T-bill rates')} page shows today's spread, and the ${h.a('t-bill-calculator', 'T-bill calculator')} turns any rate into a price.</p>

<h2>Four quarters of 13-week bills against one 52-week bill</h2>
<p>Rolling bills means reinvesting at each maturity at the new auction's rate. The table follows ${K.usd(10000)} put into the 13-week bill at the first auction of the period and rolled three times, every 13 weeks, with the whole proceeds reinvested at each auction's discount rate. Fractions of ${K.usd(100)} would in practice stay in cash; the table keeps them invested to show the rate effect alone.</p>
${h.table(['Auction', 'Investment rate', 'Invested', 'Paid at maturity'], rollRows, 'Each 13-week bill held 91 days. Price per $100 from the auction discount rate.', ['l', 'r', 'r', 'r'])}
<p>Over the four quarters the rolled bills earned ${K.usd2(rollGain)}. A single 52-week bill bought at the auction of ${K.day(first52[0])}, at ${K.pct(first52[1] / 100, 3)}, would have earned about ${K.usd2(gain52)} on the same ${K.usd(10000)} over its 364 days. The difference is the cost or the reward of keeping the rate open, and it changes sign from one year to the next.</p>

<h2>The 6, 8 and 17-week bills</h2>
<p>The other three regular terms follow the same pattern with their own levels. ${other.map(({ t, s: x }) => `The ${K.termLabel(t)} bill went from ${K.pct(x.first[1] / 100, 3)} on ${K.day(x.first[0])} to ${K.pct(x.last[1] / 100, 3)} on ${K.day(x.last[0])}, within a range of ${K.pct(x.lo[1] / 100, 3)} to ${K.pct(x.hi[1] / 100, 3)}.`).join(' ')} Having seven terms lets a buyer pick a maturity close to the date the money is needed, which matters more than a few hundredths of a percent when the money is meant for a known expense.</p>

<h2>How the figures are built</h2>
<p>The site downloads every regular bill auction from the Fiscal Data auctions dataset (${h.src('fd_auctions', 'Fiscal Data')}): the 4, 6, 8, 13, 17, 26 and 52-week bills, without cash management bills, which are sold only through banks and dealers at irregular dates (${h.src('td_tbills', 'TreasuryDirect')}). Reopenings, when the Treasury sells more of an existing bill, count as auctions of their own. The investment rate is the one the Treasury publishes; we checked that our formula reproduces it on ${K.num(K.P.checks.auctions)} auctions of 2023 and 2024.</p>
<p>Savings bond rates move on a different calendar, every May 1 and November 1: their history is on the ${h.a('i-bond-fixed-rate-history', 'I bond fixed rate history')} page. Both kinds of interest are free of state and local income tax, which the ${h.a('t-bill-state-tax', 'state tax page')} converts into a taxable-equivalent yield.</p>`,
  tool: 'tbill',
  toolArg: { tm: '13-Week' },
  related: ['t-bill-rates', 'treasury-bills', 't-bill-calculator', 't-bill-state-tax'],
  sources: ['fd_auctions', 'td_tbills', 'td_pricing'],
});
