/** llms.txt (RECETTE §21), generated from the page registry. */
import { GUIDES, STATE_PAGES, stateId } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { GROUPS, label } from '../i18n/nav';
export function GET() {
  const lines = [
    `# ${SITE_NAMES.en}`, '',
    `> Calculators for United States savings bonds and Treasury bills. The value of any Series EE or I savings bond, paper or electronic, on the first day of any month, rebuilt from the valuation rules of 31 CFR parts 351 and 359 (accrual units, rounding to the cent, three-month penalty before five years, EE doubling at original maturity, 30-year final maturity) and checked against every Treasury redemption table published from 1999 to 2023; the composite rate of every I bond by issue month from the TreasuryDirect rate history; Treasury bill yields from the Fiscal Data auction results; the taxable-equivalent yield of exempt interest with the 2026 federal brackets and the schedule of each state and DC. Independent site published by Radif Partners; general information, not personal financial advice. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label}`, ...GUIDES.filter((p) => p.group === g.id).map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`), '']),
    '## States', ...STATE_PAGES.map((s) => `- [${label(stateId(s.slug))}](${SITE_URL}${route(stateId(s.slug), 'en')}): ${s.intro}`), '',
    '## About', `- [How we calculate](${SITE_URL}${route('method', 'en')})`, `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
