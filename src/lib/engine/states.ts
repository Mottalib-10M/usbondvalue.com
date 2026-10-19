/**
 * State income tax schedules (data/states.json), one row per state and DC, read on each revenue
 * department's site. Only what reaches interest income matters here: Treasury bill and savings bond
 * interest is exempt from state and local income tax (31 U.S.C. 3124), a bank CD's is not.
 */
import S from '../../data/states.json';

export interface LocalTax { id: string; label: string; rate?: number; brackets?: { single: Array<[number, number]>; joint: Array<[number, number]> } }
export interface StateRow {
  slug: string; code: string; name: string; year: number;
  hasIncomeTax: boolean; taxesInterest: boolean;
  brackets: { single: Array<[number, number]>; joint: Array<[number, number]>; head?: Array<[number, number]> };
  surtax: string | null; local: string | null; locals?: LocalTax[];
  usInterest: string | null; sourceUrl: string; sourceTitle: string; retrieved: string; note: string | null;
  extraSources?: Array<{ url: string; title: string }>;
  /** County or city rates that reach interest, when the state publishes a range (Maryland, Indiana, Michigan). */
  localRange?: { min: number; max: number; typical: number | null };
}
export const STATES = S as unknown as Record<string, StateRow>;
export const STATE_SLUGS = Object.keys(STATES).sort((a, b) => STATES[a].name.localeCompare(STATES[b].name));
export const STATE_OPTIONS = STATE_SLUGS.map((k) => ({ value: k, label: STATES[k].name }));
/** States whose income tax does not reach interest at all: a T-bill gains nothing there over a CD. */
export const NO_TAX = STATE_SLUGS.filter((k) => !STATES[k].hasIncomeTax || !STATES[k].taxesInterest);
/** Top marginal rate of a state's single schedule (0 when no tax reaches interest). */
export const topRate = (slug: string) => { const s = STATES[slug]; const b = s.brackets.single; return !s.hasIncomeTax || !s.taxesInterest || !b.length ? 0 : b[b.length - 1][1]; };
