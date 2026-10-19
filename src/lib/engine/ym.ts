/** Year-month arithmetic. A month is an integer index: year × 12 + (month − 1). "2026-10" ⇄ 24321. */
export type YM = number;
export const ym = (s: string): YM => { const [y, m] = s.split('-').map(Number); return y * 12 + m - 1; };
export const ymStr = (n: YM): string => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
export const ymOf = (y: number, m: number): YM => y * 12 + m - 1;
export const yearOf = (n: YM) => Math.floor(n / 12);
export const monthOf = (n: YM) => (n % 12) + 1;
const NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthName = (n: YM) => `${NAMES[n % 12]} ${yearOf(n)}`;
export const monthShort = (n: YM) => `${SHORT[n % 12]} ${yearOf(n)}`;
export const MONTH_NAMES = NAMES;
/** Round to the cent the way a published table does (half up), guarding against binary noise. */
export const cents = (x: number) => Math.round(x * 100 + (x >= 0 ? 1e-7 : -1e-7)) / 100;
/** Round a rate to the hundredth of a percent (0.0001), half up. */
export const bp = (x: number) => Math.round(x * 10000 + (x >= 0 ? 1e-9 : -1e-9)) / 10000;
/** Latest entry of a sorted [ym, value] table at or before month n (undefined before the first). */
export function at<T>(table: Array<[string, T]>, n: YM): T | undefined {
  let v: T | undefined;
  for (const [k, x] of table) { if (ym(k) <= n) v = x; else break; }
  return v;
}
