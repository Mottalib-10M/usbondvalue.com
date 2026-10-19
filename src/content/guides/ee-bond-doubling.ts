import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ymN = (s: string) => Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) - 1;
const ymS = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
const on1 = (s: string) => K.month(s).replace(' ', ' 1, ');
const add = (s: string, m: number) => ymS(ymN(s) + m);
const D = K.P.bonds.eeDoublingMonths, Y = D / 12, FM = K.P.bonds.finalMaturityMonths;
const v = (r: ReturnType<typeof K.bond>) => (r.ok ? K.usd2(r.value!) : 'n/a');

// The rate that doubling equals: annual yield, and the stated rate with semiannual compounding.
const yieldD = Math.pow(2, 1 / Y) - 1;
const statedD = 2 * (Math.pow(2, 1 / (2 * Y)) - 1);
const yield17 = Math.pow(2, 1 / 17) - 1;
const cur = K.R.eeCurrent, curFrom = K.LAST, curTo = add(K.NEXT, -1);
const span = `${K.month(curFrom)} to ${K.month(curTo)}`;
// A $1,000 electronic EE bond of the current window, one month before and at 20 years, then at 30.
const amt = 1000;
const before = K.bond('EE', curFrom, add(curFrom, D - 1), 'electronic', amt);
const at = K.bond('EE', curFrom, add(curFrom, D), 'electronic', amt);
const end = K.bond('EE', curFrom, add(curFrom, FM), 'electronic', amt);
const stepCur = (at.value ?? 0) - (before.value ?? 0);
const yieldEarly = Math.pow((before.value ?? amt) / amt, 12 / (D - 1)) - 1;
// One row per May window since 2005.
const EW = K.R.ee2005 as Array<[string, number]>;
const mayW = EW.filter((w) => w[0].endsWith('-05'));
// A window doubles by its own rate when one more ordinary month of interest takes it to twice the price.
const byRate = (m: string, r: number) => {
  const b = K.bond('EE', m, add(m, D - 1), 'electronic', amt), a = K.bond('EE', m, add(m, D), 'electronic', amt);
  const step = (a.value ?? 0) - (b.value ?? 0);
  return { b, a, step, self: (b.value ?? 0) * Math.pow(1 + r / 2, 1 / 6) >= 2 * amt - 0.5 };
};
const rows = mayW.map(([m, r]) => {
  const x = byRate(m, r);
  return [K.month(m), K.pct(r), v(x.b), v(x.a), K.usd2(x.step), x.self ? 'by its rate' : 'Treasury adds the rest'];
});
// Latest run of windows with a fixed rate under 1 %.
let r1 = -1, r0 = -1;
for (let k = EW.length - 1; k >= 0; k--) { if (EW[k][1] < 0.01) { if (r1 < 0) r1 = k; r0 = k; } else if (r1 >= 0) break; }
const lowFrom = EW[r0][0], lowTo = add(EW[r1][0], 5);
const maxStep = Math.max(...mayW.map(([m]) => (K.bond('EE', m, add(m, D), 'electronic', amt).value ?? 0) - (K.bond('EE', m, add(m, D - 1), 'electronic', amt).value ?? 0)));
const selfDouble = EW.filter((w) => byRate(w[0], w[1]).self);
const lastSelf = selfDouble.length ? selfDouble[selfDouble.length - 1][0] : undefined;
// The calculator's bond: June 2006, rate of the May 2006 window.
const j06 = K.bond('EE', '2006-06', add('2006-06', D), 'electronic', amt), j06r = K.periods('EE', '2006-06', '2006-06')[0][1];
// A low-rate bond: June 2015.
const l15b = K.bond('EE', '2015-06', add('2015-06', D - 1), 'electronic', amt), l15a = K.bond('EE', '2015-06', add('2015-06', D), 'electronic', amt);
const l15r = K.periods('EE', '2015-06', '2015-06')[0][1];
// A paper bond of May 2002: face value at 17 years.
const p02b = K.bond('EE', '2002-05', add('2002-05', 203), 'paper', 100), p02a = K.bond('EE', '2002-05', add('2002-05', 204), 'paper', 100);

export default defineGuide({
  id: 'ee-bond-doubling',
  group: 'value',
  order: 60,
  slug: 'ee-bond-doubling',
  nav: 'EE doubling',
  card: 'When an EE bond doubles, the rate that equals, and the step at 20 years',
  title: 'EE Bond Doubling 2026: The 20-Year Rule and Its Date, US',
  description: `EE bond doubling in 2026: the Treasury doubles an EE bond at 20 years, worth ${K.pct(yieldD)} a year against a fixed rate of ${K.pct(cur)} on new bonds. Dates by issue month.`,
  h1: 'EE bond doubling: the 20-year step and the date of your bond',
  intro: `An EE bond issued since June 2003 is worth at least twice its price on its 20th anniversary, and when the rate falls short the Treasury pays the difference in one step that month.`,
  resume: `For EE bonds issued since June 2003, the Treasury makes the value at least twice the purchase price on the first day of the month ${Y} years after issue, adding whatever the interest has not covered. Doubling in ${Y} years equals an annual yield of ${K.pct(yieldD)}, or a stated rate of ${K.pct(statedD)} with the semiannual compounding the Treasury uses. New EE bonds bought from ${span} earn a fixed ${K.pct(cur)}, so a ${K.usd(amt)} bond of ${K.month(curFrom)} would be worth ${v(before)} one month before its anniversary and ${v(at)} on ${on1(add(curFrom, D))}: a single step of ${K.usd2(stepCur)}. Cashed a month early, it would have returned only ${K.pct(yieldEarly)} a year. A bond bought in June 2006 at ${K.pct(j06r)} doubled by its own rate and reached ${v(j06)}. After the anniversary the bond keeps earning until year ${FM / 12}. Paper EE bonds of May 1995 to May 2003 had the older version of the rule: face value, twice the price, at 17 years.`,
  faqs: [
    { q: 'Does an EE bond double even if its rate is very low?', a: `Yes, for bonds issued since June 2003, as long as you still hold it on the 20th anniversary. A ${K.usd(amt)} electronic bond of June 2015 earns ${K.pct(l15r)}; it is worth ${v(l15b)} the month before and ${v(l15a)} on ${on1(add('2015-06', D))}. The step is paid by the Treasury, it is interest like any other and it is taxed when the bond is cashed or matures.` },
    { q: 'What happens to an EE bond after it doubles?', a: `It keeps earning interest on the doubled value until ${FM / 12} years after issue, then stops. TreasuryDirect says new EE bonds earn their fixed rate for the first 20 years and that it may adjust the rate or the way they earn interest after that. The calculator continues the issue rate for years 21 to 30 unless the Treasury publishes a change.` },
    { q: 'What annual rate is the 20-year doubling worth?', a: `Doubling in 20 years is ${K.pct(yieldD)} a year compounded annually, which matches a stated rate of ${K.pct(statedD)} compounded every six months, the way savings bonds compound. Any EE bond whose fixed rate is below that needs the Treasury's step to double. The current fixed rate of ${K.pct(cur)} is below it, so for new bonds the step does most of the work.` },
    { q: 'Do EE bonds bought before June 2003 double too?', a: `Paper EE bonds issued from May 1995 to May 2003 have an older rule: they reach their face value, which is twice their price, at 17 years, an annual yield of ${K.pct(yield17)}. A ${K.usd(100)} paper bond of May 2002 was worth ${v(p02b)} one month before that date and ${v(p02a)} on it. EE bonds issued before May 1995 had other maturity rules and have all stopped earning.` },
  ],
  body: (h) => `
<h2>The rule in one sentence, and the rate it equals</h2>
<p>An EE bond issued in June 2003 or later is worth at least twice what you paid for it on its 20th anniversary, and if the interest has not taken it there, the Treasury adds the difference that month (${h.src('td_eebonds', 'TreasuryDirect')}). Twice the money in ${Y} years is the same as ${K.pct(yieldD)} a year compounded annually. Savings bonds compound every six months, so the stated rate that doubles in ${Y} years is slightly lower, ${K.pct(statedD)}. A fixed rate at or above that line doubles a bond by itself; anything below it relies on the step.</p>
<p>The current fixed rate for new EE bonds, ${K.pct(cur)} for bonds issued from ${span}, is ${cur >= statedD ? 'at or above it' : 'below it'}. ${lastSelf ? `The last window whose rate cleared the line on its own was the one that began in ${K.month(lastSelf)}.` : 'No window since May 2005 has cleared the line on its own.'} For bonds bought since then, the step carries part of the return, and for the low-rate windows nearly all of it, paid in a single month two decades after purchase.</p>

<h2>Your doubling date</h2>
<p>The date is the first day of the issue month, ${Y} years later. A bond issued in June 2006 doubled on ${on1(add('2006-06', D))}; one issued in ${K.month(curFrom)} doubles on ${on1(add(curFrom, D))}. The day of purchase within the month does not matter, because every savings bond is dated to the first of the month the Treasury receives the payment. Interest is added on the first of each month, so the bond shows its doubled value from that morning. For an electronic bond the doubling applies to the exact price paid, to the cent; for a paper bond it means reaching the face value printed on it, since the bond cost half of that.</p>
${h.mini('eedouble', { t: 'Doubling date of an EE bond', p: ['iy', 'im'], d: { iy: 2012, im: 11, amt: 2500, fm: 'electronic' } })}
<p>A bond cashed before the date gets only its own interest. With the current ${K.pct(cur)} rate, a ${K.usd(amt)} bond cashed one month before its anniversary would return ${v(before)}, an annual yield of ${K.pct(yieldEarly)}, against ${K.pct(yieldD)} for the owner who waits one more month. No other date in the life of an EE bond is worth as much.</p>

<h2>The step by purchase window</h2>
<p>The table follows a ${K.usd(amt)} electronic bond bought in each May window since 2005 to its 20th anniversary. The step is the difference between the value the month before and the value on the date. When the rate is high enough, the step is just one month of ordinary interest; when it is low, the Treasury adds a large share of the price at once.</p>
${h.table(['Bought in', 'Fixed rate', 'Month before 20 years', 'At 20 years', 'Step', 'How it doubles'], rows, `$1,000 electronic EE bond bought in each May window. Doubling rule of 31 CFR 351; rates from TreasuryDirect. Values for future dates use the fixed rate of the bond, which is known.`, ['l', 'r', 'r', 'r', 'r', 'l'])}
<p>The June 2006 bond of the calculator above is in the self-doubling group: at ${K.pct(j06r)} it passed twice its price on its own and was worth ${v(j06)} on its anniversary, slightly more than double. Bonds bought from ${K.month(lowFrom)} to ${K.month(lowTo)} sit at the other end, with rates under ${K.pct(0.01, 0)}. Their value barely moves for two decades, and nearly all of their interest is the Treasury's step, up to ${K.usd2(maxStep)} on a ${K.usd(amt)} bond in the table.</p>

<h2>After the 20th anniversary</h2>
<p>The bond does not stop at 20 years. It keeps earning, now on the doubled value, until ${FM / 12} years after issue, when interest ends and an electronic bond is paid out automatically. TreasuryDirect states that new EE bonds earn their fixed rate for the first 20 years and that it may change the rate or the method after that. The calculator here keeps the issue rate for years 21 to 30; on that basis, the ${K.usd(amt)} bond of ${K.month(curFrom)} would reach ${v(end)} at final maturity. If the Treasury announces a different rate for that stretch, the later values change and the doubled amount does not.</p>
${h.mini('bond', { t: 'Value of an EE bond in a later year', p: ['ay'], d: { sr: 'EE', fm: 'electronic', im: 5, iy: 2020, amt: 10000, am: 5, ay: 2040 } })}

<h2>The older rule: face value at 17 years</h2>
<p>EE bonds issued from May 1995 through May 2003 work differently. Their target is face value, which for a paper bond is twice the price, at 17 years (${h.src('td_ee1995', 'TreasuryDirect')}, ${h.src('td_ee1997', 'TreasuryDirect')}). That equals an annual yield of ${K.pct(yield17)}. A ${K.usd(100)} paper bond of May 2002 was worth ${v(p02b)} one month before its 17th anniversary and ${v(p02a)} on it. These bonds have all passed that point; they earn a variable rate until year 30.</p>
<p>The doubling makes the EE bond a long-hold product: little growth for years, then one large jump. ${h.a('ee-bonds', 'EE bonds today')} sets out the purchase rules, ${h.a('i-bonds-vs-ee-bonds', 'I bonds against EE bonds')} compares the two over 20 years, and ${h.a('savings-bond-taxes', 'savings bond taxes')} covers the year the step is reported.</p>`,
  tool: 'eedouble',
  toolArg: { iy: 2006, im: 6 },
  related: ['ee-bonds', 'ee-bond-value', 'i-bonds-vs-ee-bonds', 'savings-bond-value', 'savings-bond-taxes'],
  sources: ['td_eebonds', 'td_ee2005', 'td_ee1997', 'td_ee1995', 'cfr_351'],
});
