/**
 * Mini-simulator of a page (RECETTE §9.3): one or two fields of a site calculator, the subject's figure
 * in large type, two to four lines of detail and a link to the full calculator. Same engine and same
 * spec as the full tool (src/lib/tool-specs.ts). `data-chrome`: its labels count neither in the word
 * count nor in the page comparison. First render = build defaults (§17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { getTool } from '../../lib/tool-specs';
import type { V } from '../../lib/tool-types';

interface Props { kind: string; href?: string; /** JSON: { t: title, p: [input ids shown], d: { default overrides } } */ arg?: string }

export default function MiniSim({ kind, href, arg }: Props) {
  const a = useMemo(() => (arg ? JSON.parse(arg) : {}) as { t?: string; p?: string[]; d?: Record<string, number | string>; c?: string }, [arg]);
  const spec = useMemo(() => getTool(kind, a.d), [kind, a]);
  const [v, setV] = useState<V>(() => Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])));
  const shown = spec.inputs.filter((i) => (a.p ?? [spec.inputs[0].id]).includes(i.id) && !(i.showIf && String(v[i.showIf.id]) !== i.showIf.is));
  // After mount only: inputs dated "this month" move to the visitor's month (first render = build month).
  useEffect(() => { const d = new Date(); const now = spec.inputs.filter((i) => i.now && !(a.d && a.d[i.id] !== undefined)); if (now.length) setV((o) => ({ ...o, ...Object.fromEntries(now.map((i) => [i.id, String(i.now === 'm' ? d.getMonth() + 1 : d.getFullYear())])) })); }, [spec]);
  const out = useMemo(() => spec.run(v), [v, spec]);
  const set = (id: string) => (x: number | string) => setV((o) => ({ ...o, [id]: x }));
  return (
    <div data-chrome data-mini={kind} className="not-prose rechner-mini my-8 rounded-xl border border-accent-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-base font-semibold text-navy-900">{a.t ?? out.label}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        <form data-simulateur-secondaire className="grid content-start gap-y-3" onSubmit={(e) => e.preventDefault()}>
          {shown.map((i) => (i.kind === 'choice' || i.kind === 'select')
            ? <SelectField key={i.id} id={`m-${kind}-${i.id}`} label={i.label} value={String(v[i.id])} onChange={set(i.id)} options={i.options} />
            : <NumberField key={i.id} id={`m-${kind}-${i.id}`} label={i.label} value={Number(v[i.id])} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} />)}
        </form>
        <div aria-live="polite" className="rounded-lg bg-navy-50 p-4">
          <p className="text-sm font-medium text-navy-600">{out.label}</p>
          <p className="tabular-nums mt-1 text-3xl font-bold text-navy-900">{out.value}</p>
          <table className="mt-3 w-full text-sm"><tbody className="divide-y divide-navy-200">
            {out.rows.slice(0, 4).map(([l, x]) => <tr key={l}><td className="py-1.5 pr-3 text-navy-600">{l}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{x}</td></tr>)}
          </tbody></table>
        </div>
      </div>
      {href && <a href={href} className="mt-4 inline-block text-sm font-medium text-accent-700 hover:underline">{a.c ?? 'Open the full calculator'} →</a>}
    </div>
  );
}
