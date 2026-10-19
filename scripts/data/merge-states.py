#!/usr/bin/env python3
"""Builds src/data/states.json from the four research files research/states/{A,B,C,D}.json.

Each research file is the record of one reading session of state revenue department pages
(official sources only; URL, title and date in each row). This script only reshapes them:
  - key = slug of the state name ("new-york", "district-of-columbia");
  - surtaxes that work as one more bracket on taxable income are added as a bracket, from the
    row's own text (California 1 % over $1,000,000, Massachusetts 4 % over the surtax threshold,
    Maine 2 % over $1,000,000 single / $1,500,000 joint);
  - New York City brackets (resident personal income tax) become a local option "nyc".
Run: python3 scripts/data/merge-states.py
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
rows = []
for k in 'ABCD':
    p = ROOT / 'research' / 'states' / f'{k}.json'
    if not p.exists():
        sys.exit(f'missing {p}')
    rows += json.loads(p.read_text())

def slug(name):
    return re.sub(r'[^a-z]+', '-', name.lower()).strip('-')

def add_surtax(br, threshold, extra):
    """Adds `extra` to the marginal rate of every dollar of taxable income above `threshold`."""
    def rate_at(x):
        r = 0
        for lo, rt in br:
            if x >= lo: r = rt
        return r
    los = sorted(set([b[0] for b in br] + [threshold]))
    return [[lo, round(rate_at(lo) + (extra if lo >= threshold else 0), 6)] for lo in los]

SURTAX = {
    # code: (single threshold, joint threshold, extra rate) as stated in the row's surtax text
    'CA': (1000000, 1000000, 0.01),
    'MA': None,  # threshold read from the row below
    'ME': (1000000, 1500000, 0.02),
}

# Head of household files on the joint schedule in these states (NJ-1040 Table B; Maryland Schedule II).
HEAD_IS_JOINT = {'NJ', 'MD'}

out = {}
for r in rows:
    s = slug(r['name'])
    br = r['brackets'] or {}
    single = [list(x) for x in br.get('single', [])]
    joint = [list(x) for x in br.get('joint', [])]
    code = r['code']
    surt = SURTAX.get(code, 'skip')
    if code == 'MA':
        m = re.search(r'\$([\d,]+)', r.get('surtax') or '')
        if m:
            t = int(m.group(1).replace(',', ''))
            surt = (t, t, 0.04)
    if surt not in ('skip', None) and single:
        ts, tj, extra = surt
        single = add_surtax(single, ts, extra)
        joint = add_surtax(joint, tj, extra)
    row = {
        'slug': s, 'code': code, 'name': r['name'], 'year': r['year'],
        'hasIncomeTax': r['hasIncomeTax'], 'taxesInterest': r['taxesInterest'],
        'brackets': {'single': single, 'joint': joint, **({'head': br['head']} if br.get('head') else {'head': joint} if code in HEAD_IS_JOINT else {})},
        'surtax': r.get('surtax') or None, 'local': r.get('local') or None,
        'usInterest': r.get('usInterest') or None,
        'sourceUrl': r['sourceUrl'], 'sourceTitle': r['sourceTitle'], 'retrieved': r['retrieved'],
        'note': r.get('note') or None,
    }
    lb = r.get('localBrackets') or {}
    lr = r.get('localRate') or {}
    if code == 'NY' and lb.get('NYC'):
        row['locals'] = [{'id': 'nyc', 'label': 'New York City', 'brackets': {'single': lb['NYC']['single'], 'joint': lb['NYC']['joint']}}]
    if code == 'OR' and lr.get('Metro_SHS') and lr.get('Multnomah_PFA'):
        m, pfa = lr['Metro_SHS'], lr['Multnomah_PFA']
        metro = {'single': [[0, 0], [m['threshold_single'], m['rate']]], 'joint': [[0, 0], [m['threshold_joint'], m['rate']]]}
        mult = {'single': pfa['brackets_single'], 'joint': pfa['brackets_joint']}
        def both(a, b):
            los = sorted(set([x[0] for x in a] + [x[0] for x in b]))
            at = lambda br, x: max([rt for lo, rt in br if x >= lo] or [0]) if br else 0
            def rate(br, x):
                r = 0
                for lo, rt in br:
                    if x >= lo: r = rt
                return r
            return [[lo, round(rate(a, lo) + rate(b, lo), 6)] for lo in los]
        row['locals'] = [
            {'id': 'metro', 'label': 'Metro area (Supportive Housing Services tax)', 'brackets': metro},
            {'id': 'mult', 'label': 'Multnomah County (Preschool for All tax)', 'brackets': mult},
            {'id': 'both', 'label': 'Portland in Multnomah County (both taxes)', 'brackets': {'single': both(metro['single'], mult['single']), 'joint': both(metro['joint'], mult['joint'])}},
        ]
    if isinstance(lr, dict) and lr.get('min') is not None:
        row['localRange'] = lr
    if r.get('localSourceUrl'):
        row['extraSources'] = [{'url': r['localSourceUrl'], 'title': f"{r['name']} local income tax source"}]
    if r.get('extraSources'):
        row['extraSources'] = r['extraSources']
    out[s] = row

assert len(out) == 51, f'{len(out)} jurisdictions'
(ROOT / 'src' / 'data' / 'states.json').write_text(json.dumps(dict(sorted(out.items())), indent=1, ensure_ascii=False) + '\n')
print(len(out), 'jurisdictions written')
