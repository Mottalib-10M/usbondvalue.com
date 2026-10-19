/** Every page id the site is meant to have. Content tests accept links to these ids while pages are being
 *  written; the "all planned pages exist" test fails until each has its file. */
export const PLANNED_GUIDES = [
  'savings-bond-value', 'ee-bond-value', 'paper-savings-bonds', 'series-e-bond-value', 'matured-savings-bonds', 'ee-bond-doubling', 'ee-bonds',
  'i-bond-rates', 'i-bonds', 'next-i-bond-rate', 'i-bond-fixed-rate-history', 'cash-i-bonds-early', 'i-bonds-vs-ee-bonds', 'i-bond-limit',
  't-bill-rates', 'treasury-bill-rates', 'treasury-bills', 't-bill-calculator', 't-bill-vs-cd', 't-bill-state-tax',
  'cash-savings-bonds', 'savings-bond-taxes', 'savings-bonds-for-education', 'inherited-savings-bonds',
];
export const PLANNED_STATES = ['california', 'new-york', 'new-jersey', 'oregon', 'minnesota', 'hawaii', 'maryland', 'district-of-columbia'];
export const PLANNED_IDS = new Set<string>([...PLANNED_GUIDES, ...PLANNED_STATES.map((s) => `state:${s}`)]);
