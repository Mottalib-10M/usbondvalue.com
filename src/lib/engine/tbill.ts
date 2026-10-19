/**
 * Treasury bill arithmetic, as the Treasury computes it in its auction results:
 *  - price per $100 = 100 × (1 − discount rate × days ÷ 360), rounded to 6 decimals;
 *  - investment rate (bond-equivalent yield): for a bill of not more than half a year,
 *    (100 − P) ÷ P × y ÷ days; for a longer bill, the quadratic formula of the Treasury's
 *    "bond equivalent" method; y = 366 when the twelve months after the issue date contain a
 *    February 29, 365 otherwise.
 * Checked against 652 bill auctions of 2023 and 2024 (tests/tbill.test.ts), leap year included.
 */
const DAY = 86400000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const daysBetween = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY);
export function basisYear(issue: string): 365 | 366 {
  const d = toDate(issue);
  const end = new Date(Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()));
  for (let y = d.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    const f = new Date(Date.UTC(y, 1, 29));
    if (f.getUTCMonth() !== 1) continue; // not a leap year
    if (f > d && f <= end) return 366;
  }
  return 365;
}
export const priceFromDiscount = (d: number, days: number) => Math.round((100 * (1 - d * days / 360)) * 1e6) / 1e6;
export const discountFromPrice = (p: number, days: number) => (100 - p) / 100 * 360 / days;
export function investmentRate(price: number, days: number, y: 365 | 366 = 365) {
  if (days <= y / 2) return (100 - price) / price * y / days;
  const a = days / y, b = 2 * days / y - 1, c = 1 - 100 / price;
  return (-2 * a + 2 * Math.sqrt(a * a - b * c)) / b;
}
/** Annual percentage yield if each bill is rolled into an identical one at the same price. */
export const apyRolled = (price: number, days: number) => Math.pow(100 / price, 365 / days) - 1;

/** Purchase of a bill: you pay the price, you receive the face value at maturity. */
export function billBuy(face: number, discount: number, days: number, issue?: string) {
  const p = priceFromDiscount(discount, days);
  const cost = Math.round(face * p) / 100;
  const y = issue ? basisYear(issue) : 365;
  return { pricePer100: p, cost, interest: Math.round((face - cost) * 100) / 100, investmentRate: investmentRate(p, days, y), apy: apyRolled(p, days) };
}
