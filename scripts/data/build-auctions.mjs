#!/usr/bin/env node
/**
 * Latest Treasury bill auctions → src/data/auctions.json (replayable, run before each build or by a
 * scheduled job). Source: Fiscal Data, "Treasury Securities Auctions Data" API
 * (https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query),
 * public U.S. government data, free to reuse without restriction. Only regular bills (4, 6, 8, 13,
 * 17, 26 and 52 weeks), no cash management bills. The site never calls the API from the browser.
 *   node scripts/data/build-auctions.mjs [--fixture]   (--fixture: also writes the 2023-2024 test set)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
const API = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query';
const F = 'cusip,security_term,auction_date,issue_date,maturity_date,high_discnt_rate,high_investment_rate,high_price,cash_management_bill_cmb,reopening,offering_amt,total_accepted,bid_to_cover_ratio';
const TERMS = ['4-Week', '6-Week', '8-Week', '13-Week', '17-Week', '26-Week', '52-Week'];
async function pull(filter) {
  const out = [];
  for (let p = 1; p < 20; p++) {
    const r = await fetch(`${API}?filter=${filter}&fields=${F}&sort=-auction_date&page%5Bsize%5D=1000&page%5Bnumber%5D=${p}`);
    const j = await r.json();
    if (!j.data?.length) break;
    out.push(...j.data);
    if (p >= j.meta['total-pages']) break;
  }
  return out;
}
const num = (x) => (x === null || x === 'null' || x === undefined ? null : Number(x));
const tidy = (r) => ({ term: r.security_term, cusip: r.cusip, auction: r.auction_date, issue: r.issue_date, maturity: r.maturity_date, discount: num(r.high_discnt_rate), investment: num(r.high_investment_rate), price: num(r.high_price), reopening: r.reopening === 'Yes', offering: num(r.offering_amt), accepted: num(r.total_accepted), bidToCover: num(r.bid_to_cover_ratio) });
const since = new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10);
const rows = (await pull(`security_type:eq:Bill,auction_date:gte:${since}`)).filter((r) => r.cash_management_bill_cmb !== 'Yes' && TERMS.includes(r.security_term)).map(tidy);
const done = rows.filter((r) => r.discount !== null);
const upcoming = rows.filter((r) => r.discount === null).sort((a, b) => a.auction.localeCompare(b.auction));
const latest = Object.fromEntries(TERMS.map((t) => [t, done.filter((r) => r.term === t).sort((a, b) => b.auction.localeCompare(a.auction))[0]]).filter(([, v]) => v));
const history = Object.fromEntries(TERMS.map((t) => [t, done.filter((r) => r.term === t).sort((a, b) => a.auction.localeCompare(b.auction)).map((r) => [r.auction, r.investment, r.discount])]));
writeFileSync(new URL('../../src/data/auctions.json', import.meta.url), JSON.stringify({ _source: 'Fiscal Data, Treasury Securities Auctions Data (auctions_query), regular bills only', built: new Date().toISOString().slice(0, 10), latest, upcoming, history }, null, 0));
console.log('latest:', Object.values(latest).map((r) => `${r.term} ${r.auction} ${r.investment}`).join(' | '), '| upcoming', upcoming.length);
if (process.argv.includes('--fixture')) {
  const fx = (await pull('security_type:eq:Bill,auction_date:gte:2023-01-01,auction_date:lte:2024-12-31')).filter((r) => r.high_discnt_rate !== 'null' && r.high_investment_rate !== 'null').map(tidy);
  mkdirSync(new URL('../../tests/fixtures/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../../tests/fixtures/bills-2023-2024.json', import.meta.url), JSON.stringify(fx));
  console.log('fixture', fx.length);
}
