import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const B = K.P.bonds;
// Worked case: a $500 paper EE bond issued in March 2000, cashed this month.
const ex = K.bond('EE', '2000-03', K.BUILD, 'paper', 500);
// When is the best month to cash? Paper EE and I bonds of $1,000 face value, cashed now or at the next month.
const shift = (m: string, k: number) => { const [y, mo] = m.split('-').map(Number); const n = y * 12 + mo - 1 + k; return `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`; };
const cases: Array<[string, 'EE' | 'I', string]> = [['EE bond, May 1998', 'EE', '1998-05'], ['EE bond, January 2006', 'EE', '2006-01'], ['I bond, November 2001', 'I', '2001-11'], ['I bond, September 2021', 'I', '2021-09']];
const NEXT = shift(K.BUILD, 1);
const rows = cases.map(([label, sr, iss]) => {
  const a = K.bond(sr, iss, K.BUILD, 'paper', 1000), b = K.bond(sr, iss, NEXT, 'paper', 1000);
  return [label, a.ok ? K.usd2(a.value!) : 'n/a', b.ok ? K.usd2(b.value!) : 'not yet announced', a.ok ? K.month(K.periods(sr, iss, K.BUILD).slice(-1)[0]?.[0] ?? iss) : ''];
});
// A bond that has stopped earning: Series EE of 1990, 30 years reached in 1990 + 30.
const stopped = K.bond('EE', '1990-07', K.BUILD, 'paper', 100);

export default defineGuide({
  id: 'cash-savings-bonds',
  group: 'tax',
  order: 10,
  slug: 'cash-savings-bonds',
  nav: 'Cashing savings bonds',
  card: 'Paper at a bank or by mail, electronic in TreasuryDirect',
  title: 'Cash Savings Bonds 2026: Paper, Electronic and Value, US',
  description: `How to cash savings bonds in 2026: paper bonds at a bank or with FS Form 1522, electronic ones in TreasuryDirect from ${K.usd(B.electronicMin)}. See the value, the tax and timing.`,
  h1: 'How to cash savings bonds, paper or electronic',
  intro: `Savings bonds can be cashed after one year. Electronic bonds are redeemed in TreasuryDirect, in part or in full; paper bonds at a bank that offers it, or by mail with FS Form 1522. Check the value first.`,
  resume: `To cash a savings bond you need to know its form. An electronic EE or I bond is redeemed in your TreasuryDirect account, under ManageDirect, Redeem securities: any amount from ${K.usd(B.electronicMin)} to the cent, as long as at least ${K.usd(B.electronicMin)} stays in the bond, and the money goes to your linked bank account. A paper bond is cashed whole, either at a bank that offers the service, which sets its own limits and identification rules, or by mail to the Treasury with FS Form 1522; above ${K.usd(B.signatureCertificationOver)} your signature must be certified. A bond can be cashed once it is 12 months old; before five years, the last three months of interest are lost. A ${K.usd(500)} paper EE bond issued in March 2000 is worth ${ex.ok ? K.usd2(ex.value!) : 'n/a'} on the first of ${K.month(K.BUILD)}, for ${ex.ok ? K.usd2(ex.interest!) : 'n/a'} of interest on a price of ${ex.ok ? K.usd2(ex.price!) : 'n/a'}. That interest is subject to federal income tax for the year you cash, and not to state or local income tax. The calculator gives the value of any bond for any month.`,
  faqs: [
    { q: 'Can I cash savings bonds at any bank?', a: `Only at banks that choose to offer it, and each sets its own rules: some cash bonds only for their customers, many cap the amount per visit, and all ask for identification. Call before you go. The Treasury itself has no limit on bonds cashed by mail with FS Form 1522, but asks for a certified signature above ${K.usd(B.signatureCertificationOver)}.` },
    { q: 'Can I cash a paper savings bond online?', a: 'Not directly. You can first convert the paper bond into an electronic one in a TreasuryDirect account, by mailing it with a manifest from the account, and then redeem the electronic bond online. The conversion is free and cannot be undone. Do not sign the back of a bond you convert.' },
    { q: 'When is the best day to cash a savings bond?', a: 'Early in a month rather than late. Interest is added on the first day of each month, so a bond cashed on the 30th gets nothing more for that month. For older paper EE bonds issued before May 1997, interest was credited every six months, so cashing just after a credit date matters more. After five years there is no penalty.' },
  ],
  body: (h) => `
<h2>Electronic bonds in TreasuryDirect</h2>
<p>Log in, open ManageDirect and choose Redeem securities under Manage My Securities (${h.src('td_cashing', 'TreasuryDirect, cashing EE or I bonds')}). You can cash all or part of a bond: any amount of ${K.usd(B.electronicMin)} or more, to the penny, provided at least ${K.usd(B.electronicMin)} stays in it. The part you cash carries only its share of the interest, and the rest keeps earning on its original dates. The money is sent to the bank account linked to your TreasuryDirect account, and the Form 1099-INT appears in the account in January of the following year. The current value is shown under Current Holdings; it already takes off the three-month penalty for bonds less than five years old.</p>

<h2>Paper bonds at a bank or by mail</h2>
<p>A paper bond is always cashed for its full value. At a bank, ask first whether it cashes savings bonds, how much it will cash at once and what documents it needs; banks vary, and some do not offer the service. By mail, fill in FS Form 1522 (${h.src('td_form1522', 'FS Form 1522')}), have your signature certified if the bonds are worth more than ${K.usd(B.signatureCertificationOver)}, and send the form with the bonds to the address printed on it. Signatures are certified by an authorized officer at a bank or credit union, not by a notary in most cases; the form lists who qualifies. The Treasury has no limit on the number or value of bonds cashed by mail, and mails the 1099-INT the following January. A bank that cashes a bond sends its own 1099-INT, either at once or the next January.</p>
${h.mini('bond', { t: 'Value of your paper bond before you go', p: ['sr', 'iy', 'amt'], d: { sr: 'EE', fm: 'paper', iy: 1995, im: 6, amt: 100 } })}

<h2>What a bond pays this month and next</h2>
<p>A bond gains value on the first of each month, so waiting a few days can add a month of interest. The table shows four paper bonds of ${K.usd(1000)} face value, cashed on the first of ${K.month(K.BUILD)} and on the first of ${K.month(NEXT)}, with the start of the rate period they are in.</p>
${h.table(['Bond', `Value ${K.month(K.BUILD)}`, `Value ${K.month(NEXT)}`, 'Current rate period from'], rows, `Paper bonds of ${K.usd(1000)} face value. Values from the Treasury's rules and the rates announced through October 2026.`, ['l', 'r', 'r', 'l'])}
<p>The November values are already fixed, because the interest added on November 1 is earned at the rate of the period ending in October. From December on, an I bond whose rate period starts in November depends on the composite rate announced on November 1, 2026. EE bonds issued since May 2005 keep a fixed rate, but those from May 1997 to April 2005 also take a new rate every six months.</p>

<h2>Bonds that no longer earn</h2>
<p>A bond stops earning at final maturity: 30 years for EE and I bonds, 40 years for Series E bonds issued before December 1965. After that its value no longer grows, and holding it only delays the tax. An EE bond issued in July 1990 is worth ${stopped.ok ? K.usd2(stopped.value!) : 'n/a'} per ${K.usd(100)} of face value and stopped earning in ${K.month('2020-07')}. The interest of a matured bond is taxable for the year of final maturity even if the bond is not cashed. The ${h.a('matured-savings-bonds', 'matured bonds page')} lists the cohorts that have stopped and what to do with them.</p>

<h2>Special situations</h2>
<p>The Treasury has separate procedures for bonds of someone who has died, bonds held in a trust, bonds of a person represented by an attorney-in-fact or a guardian, bonds of a young child, owners outside the United States and owners affected by a disaster (${h.src('td_cashing', 'TreasuryDirect')}). Bonds bought from someone else or on an auction site cannot be cashed: only an owner, a co-owner or a person with documents the Treasury accepts can redeem a bond. If you are unsure whether a paper bond was already cashed or replaced, a letter to Treasury Retail Securities Services with the serial numbers, without the bonds, gets an answer. The ${h.a('inherited-savings-bonds', 'inherited bonds page')} covers bonds of a deceased owner.</p>

<h2>Tax when you cash</h2>
<p>The interest is reported on your federal return for the year you cash, on the line for interest income, unless you chose to report it each year. It is exempt from state and local income tax (${h.src('usc_3124', '31 U.S.C. 3124')}). Bonds cashed to pay tuition may be partly or fully tax-free under the ${h.a('savings-bonds-for-education', 'education exclusion')}. Cashing a large amount in one year can push part of the interest into a higher bracket; spreading redemptions over several years, or cashing in a year of lower income, can lower the bill. The ${h.a('savings-bond-taxes', 'tax page')} has a calculator for the federal tax on a given amount of interest.</p>`,
  tool: 'bond',
  toolArg: { sr: 'EE', fm: 'paper', iy: 2000, im: 3, amt: 500 },
  related: ['savings-bond-value', 'paper-savings-bonds', 'savings-bond-taxes', 'matured-savings-bonds', 'inherited-savings-bonds'],
  sources: ['td_cashing', 'td_form1522', 'td_convert', 'td_tax', 'usc_3124'],
});
