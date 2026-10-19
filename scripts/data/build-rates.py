#!/usr/bin/env python3
"""Rebuild src/data/rates.json from the Treasury's own publications (replayable).

  python3 -I scripts/data/build-rates.py [--cache DIR]

Sources (read by this script, never typed by hand):
  - Series I rate history workbook: https://www.treasurydirect.gov/files/savings-bonds/series-i-ussb-interest-rate-history.xlsx
    (sheet "Data": CPI-U, semiannual inflation rate, fixed rate, period start).
  - EE rate pages on treasurydirect.gov (May 2005 and later; May 1997 through April 2005;
    May 1995 through April 1997; 1980 through April 1995): HTML tables of announced rates.
Needs openpyxl (pip install openpyxl). Downloads go to --cache (default: .cache-raw/rates).
"""
import html, json, os, re, sys, urllib.request, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cache = sys.argv[sys.argv.index('--cache') + 1] if '--cache' in sys.argv else os.path.join(ROOT, '.cache-raw', 'rates')
os.makedirs(cache, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (rates rebuild; contact via site)'}
TD = 'https://www.treasurydirect.gov'
PAGES = {
    'ee2005': '/savings-bonds/ee-bonds/may-2005-and-later/',
    'ee1997': '/savings-bonds/ee-bonds/may-1997-through-april-2005/',
    'ee1995': '/savings-bonds/ee-bonds/may-1995-through-april-1997/',
    'ee1980': '/savings-bonds/ee-bonds/1980-through-1995/',
    'ibond': '/savings-bonds/i-bonds/i-bonds-interest-rates/',
}
XLSX = '/files/savings-bonds/series-i-ussb-interest-rate-history.xlsx'

def get(path, name):
    f = os.path.join(cache, name)
    if not os.path.exists(f):
        with urllib.request.urlopen(urllib.request.Request(TD + path, headers=UA), timeout=60) as r, open(f, 'wb') as o:
            o.write(r.read())
    return f

def text(f):
    t = open(f, encoding='utf-8', errors='ignore').read()
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    return re.sub(r'\s+', ' ', t)

MONTHS = {m: i + 1 for i, m in enumerate(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])}
DATE_RATE = re.compile(r'(January|February|March|April|May|June|July|August|September|October|November|December) 1, (\d{4}) (-?\d+\.\d+)%')

def pairs(seg):
    return [(f'{y}-{MONTHS[m]:02d}', round(float(r) / 100, 6)) for m, y, r in DATE_RATE.findall(seg)]

out = {'_source': 'Built by scripts/data/build-rates.py from treasurydirect.gov pages and the Series I rate history workbook.',
       'built': datetime.date.today().isoformat()}

# ---- Series I: the official workbook (inflation rate and fixed rate per 6-month window).
import openpyxl
wb = openpyxl.load_workbook(get(XLSX, 'i-history.xlsx'), data_only=True)
rows = []
for r in wb['Data'].iter_rows(min_row=4, values_only=True):
    if r[0] is None or r[5] is None:
        continue
    rows.append({'from': r[5].strftime('%Y-%m'), 'cpi': round(float(r[0]), 3), 'inflation': round(float(r[1]), 4), 'fixed': round(float(r[2]), 4)})
out['i'] = {'note': 'One row per announcement window: fixed rate for bonds issued in the window, semiannual inflation rate announced at its start, CPI-U used.', 'windows': rows}
# The September 1998 offering had its own fixed rate (3.40 %) announced September 1, 1998.
t = text(get(PAGES['ibond'], 'ibond.html'))
seg = t[t.find('Fixed rates'):t.find('Inflation rates', t.find('Fixed rates'))]
out['i']['fixedTable'] = pairs(seg)

# ---- EE since May 2005: fixed rate per issue window.
t = text(get(PAGES['ee2005'], 'ee2005.html'))
seg = t[t.find('Interest rates for EE bonds since May 2005'):]
out['ee2005'] = pairs(seg)
m = re.search(r'Current Interest Rate Series EE Savings Bonds (\d+\.\d+)%', t)
out['eeCurrent'] = round(float(m.group(1)) / 100, 6)

# ---- EE May 1997 - April 2005: variable savings bonds rate per announcement.
t = text(get(PAGES['ee1997'], 'ee1997.html'))
seg = t[t.find('What have interest rates been for EE bonds we issued from May 1997'):]
out['ee1997'] = pairs(seg)

# ---- EE May 1995 - April 1997: long-term rate since Nov 2001, then short/long table 1995-2001.
t = text(get(PAGES['ee1995'], 'ee1995.html'))
a = t.find('What have interest rates been for EE bonds we issued from May 1995')
b = t.find('For the first 5 years of their life', a)
out['ee1995Long'] = pairs(t[a:b])
seg = t[t.find('applied starting in the bond'):]
seg = seg[:seg.find('(From May 1994')]
short, long_ = [], []
for m_, y, s, l in re.findall(r'(January|February|March|April|May|June|July|August|September|October|November|December) 1, (\d{4}) (\d+\.\d+)% (\d+\.\d+%|Not applicable \(N/A\)|N/A)', seg):
    ym = f'{y}-{MONTHS[m_]:02d}'
    short.append((ym, round(float(s) / 100, 6)))
    if l.endswith('%'):
        long_.append((ym, round(float(l[:-1]) / 100, 6)))
out['ee1995Short'] = short
out['ee1995Long'] = sorted(set(out['ee1995Long']) | set(long_), reverse=True)

# ---- EE before May 1995: 5-year Treasury yields used for the market-based rate.
t = text(get(PAGES['ee1980'], 'ee1980.html'))
seg = t[t.find('5-year Treasury securities yield we used to set the rate'):]
out['ee1980FiveYear'] = pairs(seg)

for k in ('ee2005', 'ee1997', 'ee1995Long', 'ee1995Short', 'ee1980FiveYear'):
    out[k] = [list(x) for x in sorted(out[k])]
out['i']['fixedTable'] = [list(x) for x in sorted(out['i']['fixedTable'])]
json.dump(out, open(os.path.join(ROOT, 'src', 'data', 'rates.json'), 'w'), indent=1)
print('I windows', len(rows), 'fixed', len(out['i']['fixedTable']), '| EE2005', len(out['ee2005']), '| EE1997', len(out['ee1997']),
      '| EE1995 short', len(out['ee1995Short']), 'long', len(out['ee1995Long']), '| 5y', len(out['ee1980FiveYear']), '| EE now', out['eeCurrent'])
