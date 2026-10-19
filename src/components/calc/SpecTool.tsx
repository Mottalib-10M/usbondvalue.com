/**
 * Renders one declarative calculator (src/lib/tool-specs.ts): fields on the left, the result card on the
 * right (data-resultat), folded advanced options, a share link written only after a user action.
 * First render = build defaults; after mount, `now` inputs take the visitor's current month and a
 * shared link is read (RECETTE §17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Choice, ResultCard, Rows, ShareRow } from './parts';
import { readParams, updateURL } from '../../lib/url-state';
import { getTool } from '../../lib/tool-specs';
import type { Input, V } from '../../lib/tool-types';

interface Props { kind: string; arg?: string; methodHref?: string; idPrefix?: string }

export default function SpecTool({ kind, arg, methodHref, idPrefix = 't' }: Props) {
  const spec = useMemo(() => getTool(kind, arg ? JSON.parse(arg) : undefined), [kind, arg]);
  const defaults = useMemo(() => Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])) as V, [spec]);
  const [v, setV] = useState<V>(defaults);
  useEffect(() => {
    const u = readParams(window.location.search);
    const today = new Date();
    const next: V = { ...defaults };
    const fixed: Record<string, unknown> = arg ? JSON.parse(arg) : {};
    for (const i of spec.inputs) if (i.now && fixed[i.id] === undefined) next[i.id] = String(i.now === 'm' ? today.getMonth() + 1 : today.getFullYear());
    for (const i of spec.inputs) {
      const x = u.get(i.id);
      if (x === null) continue;
      if (i.kind === 'choice' || i.kind === 'select') { if (i.options.some((o) => o.value === x)) next[i.id] = x; }
      else { const f = parseFloat(x); if (!isNaN(f)) next[i.id] = Math.min(f, i.max ?? Infinity); }
    }
    setV(next);
  }, []);
  useEffect(() => updateURL(v as Record<string, string | number>), [v]);
  const out = useMemo(() => spec.run(v), [v, spec]);
  const set = (id: string) => (x: number | string) => setV((o) => ({ ...o, [id]: x }));
  const field = (i: Input) => {
    if (i.showIf && String(v[i.showIf.id]) !== i.showIf.is) return null;
    const id = `${idPrefix}-${i.id}`;
    const cls = i.wide ? 'sm:col-span-2' : '';
    if (i.kind === 'choice') return <div key={i.id} className={`grid grid-rows-subgrid row-span-3 ${cls}`}><Choice id={id} label={i.label} value={String(v[i.id])} options={i.options} onChange={set(i.id)} /></div>;
    if (i.kind === 'select') return <SelectField key={i.id} id={id} label={i.label} value={String(v[i.id])} onChange={set(i.id)} options={i.options} help={i.help} className={cls} />;
    return <NumberField key={i.id} id={id} label={i.label} value={Number(v[i.id])} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} help={i.help} className={cls} />;
  };
  const main = spec.inputs.filter((i) => !i.adv), adv = spec.inputs.filter((i) => i.adv);
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form className="grid content-start grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          {main.map(field)}
          {adv.length > 0 && (
            <details className="sm:col-span-2 rounded-lg border border-navy-200 px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-navy-700">More options</summary>
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">{adv.map(field)}</div>
            </details>
          )}
        </form>
        <ResultCard label={out.label} value={out.value} sub={out.sub}>
          <Rows rows={out.rows} />
          {out.note && <p className="mt-2 text-xs text-navy-600">{out.note}</p>}
          <ShareRow methodHref={methodHref} />
        </ResultCard>
      </div>
      {out.table && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            {out.table.caption && <caption className="mb-2 text-left text-sm text-navy-700">{out.table.caption}</caption>}
            <thead><tr>{out.table.headers.map((h, i) => <th key={h} scope="col" className={`border-b border-navy-200 px-2 py-1.5 font-semibold text-navy-900 ${out.table!.align?.[i] === 'r' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
            <tbody>{out.table.rows.map((r, k) => <tr key={k}>{r.map((c, i) => <td key={i} className={`tabular-nums border-b border-navy-100 px-2 py-1.5 text-navy-800 ${out.table!.align?.[i] === 'r' ? 'text-right' : 'text-left'}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
