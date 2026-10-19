/** Registry: every file of src/content/{guides,states} is loaded here. */
import type { GuideDef, StateDef } from './page-types';
import { STATES } from './engine/states';

const base = (file: string) => file.split('/').pop()!.replace(/\.ts$/, '');
const g = import.meta.glob<{ default: GuideDef }>(['../content/guides/*.ts', '!../content/guides/_*.ts'], { eager: true });
export const GUIDES: GuideDef[] = Object.entries(g).map(([f, m]) => {
  if (m.default.id !== base(f)) throw new Error(`${f}: id "${m.default.id}" differs from the file name`);
  return m.default;
}).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
export const guideById = (id: string) => GUIDES.find((p) => p.id === id);

const s = import.meta.glob<{ default: StateDef }>(['../content/states/*.ts', '!../content/states/_*.ts'], { eager: true });
export const STATE_PAGES: StateDef[] = Object.entries(s).map(([f, m]) => {
  if (m.default.slug !== base(f)) throw new Error(`${f}: slug "${m.default.slug}" differs from the file name`);
  if (!STATES[m.default.slug]) throw new Error(`${f}: unknown state`);
  return m.default;
}).sort((a, b) => a.slug.localeCompare(b.slug));
export const stateId = (slug: string) => `state:${slug}`;
export const statePageById = (id: string) => STATE_PAGES.find((p) => stateId(p.slug) === id);
/** First guide that carries a calculator: the target of a mini-simulator's link. */
export const pageOfTool = (kind: string) => GUIDES.find((p) => p.tool === kind)?.id;
