#!/usr/bin/env python3
"""Treasury redemption tables (Fiscal Data API) → test oracle + frozen values (replayable).

  python3 -I scripts/data/build-oracle.py [--cache DIR]

API: https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/redemption_tables
(Bureau of the Fiscal Service, "Savings Bonds Redemption Tables", 291 monthly tables, March 1999 to
May 2023; no table has been published since). Fiscal Data is public U.S. government data, free to reuse.

Writes:
  tests/fixtures/oracle.json  value of a $100 face bond for every issue month (Series I, Series EE
                              issued May 1995 or later) and every redemption month of the tables;
  src/data/frozen.json        final value of a $100 face bond that no longer earns interest
                              (Series E, savings notes, Series EE issued before May 1995), read in the
                              last table after its final maturity.
"""
import json, os, sys, urllib.request, urllib.error, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cache = sys.argv[sys.argv.index('--cache') + 1] if '--cache' in sys.argv else os.path.join(ROOT, '.cache-raw', 'redemption')
os.makedirs(cache, exist_ok=True)
API = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/redemption_tables'
rows = []
for p in range(1, 40):
    f = os.path.join(cache, f'p{p}.json')
    if not os.path.exists(f):
        try:
            with urllib.request.urlopen(f'{API}?page%5Bsize%5D=10000&page%5Bnumber%5D={p}', timeout=120) as r:
                body = r.read()
        except urllib.error.HTTPError:
            break  # past the last page
        open(f, 'wb').write(body)
    d = json.load(open(f))['data']
    if not d:
        break
    rows += d
M = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6, 'june': 6, 'jul': 7, 'july': 7, 'aug': 8, 'sep': 9, 'sept': 9, 'oct': 10, 'nov': 11, 'dec': 12}
SER = {'Series I': 'I', 'Series EE': 'EE', 'Series EE - Matured': 'EE', 'Series EE Matured': 'EE', 'Series E': 'E', 'Series E - Matured': 'E', 'Savings Notes': 'SN'}
vals = collections.defaultdict(dict)
for r in rows:
    s = SER[' '.join(r['issue_name'].split())]
    parts = [x.strip() for x in r['issue_months'].lower().replace('.', '').split('-')]
    ms = [M[parts[0]]] if len(parts) == 1 else list(range(M[parts[0]], M[parts[1]] + 1))
    v = r['redemp_value_100_amt']
    if v in (None, 'null', ''):
        continue
    for m in ms:
        vals[f"{s}|{int(r['issue_year'])}-{m:02d}"][r['redemp_period']] = float(v)
periods = sorted({p for d in vals.values() for p in d})
last = periods[-1]
idx = lambda s: int(s[:4]) * 12 + int(s[5:7]) - 1
oracle, frozen, partial = {}, {}, {}
for k, d in vals.items():
    s, issue = k.split('|')
    if s == 'I' or (s == 'EE' and issue >= '1995-05'):
        ks = sorted(d)
        start = ks[0]
        seq = []
        for n in range(idx(start), idx(ks[-1]) + 1):
            p = f'{n // 12}-{n % 12 + 1:02d}'
            seq.append(d.get(p))
        oracle[k] = {'from': start, 'v': seq}
    else:
        final = idx(issue) + (480 if s == 'E' and issue <= '1965-11' else 360)
        latest = max(d)
        if final <= idx(latest):
            frozen[k] = d[latest]
        elif s == 'EE':
            partial[k] = {'table': latest, 'v100': d[latest]}
json.dump({'_source': f'Fiscal Data, Savings Bonds Redemption Tables, {periods[0]} to {last}', 'periods': len(periods), 'series': oracle}, open(os.path.join(ROOT, 'tests', 'fixtures', 'oracle.json'), 'w'), separators=(',', ':'))
json.dump({'_source': 'Bureau of the Fiscal Service, Savings Bonds Redemption Tables (Fiscal Data API), last table published', 'table': last, 'values': frozen, 'partial': partial}, open(os.path.join(ROOT, 'src', 'data', 'frozen.json'), 'w'), separators=(',', ':'))
print('tables', len(periods), periods[0], last, '| oracle issue months', len(oracle), 'values', sum(sum(x is not None for x in o['v']) for o in oracle.values()), '| frozen', len(frozen), collections.Counter(k.split('|')[0] for k in frozen))
