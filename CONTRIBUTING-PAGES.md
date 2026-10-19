# Écrire ou étoffer une page de US Bond Value (us-savings-bonds)

Notice pour les agents qui écrivent les pages. À lire en entier avant d'écrire, avec
`~/Documents/GitHub/RECETTE-SITE.md` (§0, §5, §6, §6.5, §7, §9.3, §11, §17.4, §21, §26).

**Le site** : valeur des savings bonds américains (Series EE et I, papier et électroniques, plus les anciens E et savings
notes), taux composite de chaque I bond selon son mois d'émission, prochain taux du 1er novembre 2026, Treasury bills
(4, 6, 8, 13, 17, 26, 52 semaines) et leur équivalent imposable par État, impôt fédéral sur les intérêts, exclusion pour
études (Form 8815), bonds hérités. **Anglais américain seul**, sous `/en/`. Éditeur : la société **Radif Partners**
(jamais un nom de personne). Nom provisoire : « US Bond Value ».

**L'angle (phrase de valeur ajoutée)** : le calculateur du Trésor ne traite que les bonds papier, un par un, et s'arrête à la
période en cours ; les articles qui classent sur « i bond rates » datent de 2022 à 2024 ; les pages T-bill font saisir son
taux d'État à la main. Nous donnons la valeur papier **et** électronique mois par mois (moteur vérifié contre les 291 tables
de rachat du Trésor, 93 786 valeurs au cent près), le taux actuel de chaque I bond, et l'équivalent imposable avec le barème
2026 de chaque État. Rapport SERP : `~/Documents/GitHub/reports/us-savings-bonds-serp-2026-10-19.md`.

## Interdits

- Jamais se présenter comme le Trésor, TreasuryDirect ou l'IRS ; jamais « official calculator ». Aucun lien vers une banque,
  un courtier, un conseiller (fidelity, schwab, vanguard, bankrate, nerdwallet…), aucun conseil personnalisé (« you should
  cash »), aucune promesse. Liens externes : seulement des sources officielles (treasurydirect.gov, fiscaldata.treasury.gov,
  irs.gov, ecfr.gov, bls.gov, uscode.house.gov, sites .gov des États) par `h.src(clé)` ou `h.ext(url, texte)` pour une URL
  officielle **que tu as lue** (à signaler dans ton compte rendu).
- Aucun lien ni copie vers un site du portefeuille (`~/Documents/GitHub/_trame/domaines-ovh.txt`).
- **Un chiffre incertain ne se publie pas.** Tout chiffre vient du kit (`K.…`) ou d'un calcul du moteur. Un nombre absent du
  kit ne s'écrit pas, sauf lu toi-même sur une source officielle (alors `h.ext`, et signale-le). Pas de projection présentée
  comme officielle : un taux non annoncé s'écrit « announced November 1, 2026 ».
- Dates écrites en toutes lettres (« November 1, 2026 », `K.day`, `K.month`), jamais 2026-11-01 dans le texte.

## D'où viennent les chiffres

| Donnée | Source | Fichier |
|---|---|---|
| Taux I bond (fixe, inflation, CPI) depuis 1998 | TreasuryDirect, classeur Series I | `src/data/rates.json` (`i.windows`, `i.fixedTable`) |
| Taux EE (mai 2005+ fixe, 1997-2005, 1995-1997) | pages de taux TreasuryDirect | `rates.json` (`ee2005`, `eeCurrent`, `ee1997`, `ee1995Short/Long`) |
| Valeurs finales des E, EE < mai 1995, savings notes | table de rachat de mai 2023 (Fiscal Data) | `src/data/frozen.json` |
| Enchères T-bills (dernières, à venir, historique) | Fiscal Data, auctions_query | `src/data/auctions.json` |
| Unités, pénalité, limites 10 000 $, seuils, prochain taux, barèmes fédéraux 2026, exclusion études 2026 | 31 CFR 351/359, TreasuryDirect, Rev. Proc. 2025-32, Pub. 970 | `src/data/params-2026.json` |
| Barèmes d'État 2026 (2025 si 2026 non publié), 50 États + DC | sites des administrations fiscales, lus le 2026-10-19 | `src/data/states.json` |

Textes officiels extraits pour lire avant d'écrire une règle : `research/sources/*.txt` (pages TreasuryDirect : limites,
encaissement, impôt, études, décès, conversion, HH, cadeaux, T-bills, prix ; IRS Pub. 550 et 970).

## Les fichiers d'une page

| Page | Fichier | Route |
|---|---|---|
| Sujet + calculateur | `src/content/guides/<id>.ts` (`defineGuide`) | `/en/<slug>/` |
| État | `src/content/states/<slug>.ts` (`defineState`, slug = clé de `states.json`) | `/en/t-bill-state-tax/<slug>/` |
| Accueil | `src/content/home.ts` | `/en/` |

Pages prévues : `src/lib/planned.ts`. **Modèle (copier la structure, jamais les phrases)** : `src/content/guides/i-bond-rates.ts`.

Le gabarit affiche seul : H1, `intro`, le calculateur (`tool`, réglé par `toolArg`), le chapeau replié (`resume`), le corps
(`body`), la FAQ, les pages liées, les sources. Sur un État : H1 fixé par le gabarit, le calculateur `teq` réglé sur l'État
(`toolArg` pour le revenu ou `nyc: 'yes'`), les sources de l'État.

### Champs

| Champ | Règle |
|---|---|
| `title` | **50 à 60 caractères**, contient **2026**, **terme-clé en tête puis le pays** (« EE Bond Value 2026: …, US »). Jamais How/What/When/Is/Can ni « US »/« Calculator » en tête ; pas de tiret cadratin ni demi-cadratin ; unique. L'espace insécable de « 4.26 % » compte pour un caractère |
| `description` | **150 à 160 caractères**, contient 2026, un chiffre du kit, unique |
| `intro` | une phrase propre à la page |
| `resume` | **UN** paragraphe de 120 mots ou plus (viser 130 à 170) : la réponse, chiffres compris ; la première phrase porte le message |
| `body(h)` | HTML (`h2`, `h3`, `p`, `ul`, `h.table`). Guides : ≥ 650 mots de prose hors tableaux (viser 750 à 1 000). États : ≥ 300 (viser 350 à 500) |
| `faqs` | 3 à 6 vraies questions, réponses **40 à 90 mots** ; **une question n'existe qu'une fois sur tout le site** |
| `related` | 3 à 6 ids (`i-bond-rates`, `state:california`…) |
| `sources` (guides) | ≥ 2 clés de `params-2026.json > sources` |
| `tool` | une clé de `src/lib/tool-specs.ts` : `bond` (valeur complète), `rate` (taux d'un bond), `inext` (taux du 1er novembre), `icash` (encaisser ou attendre), `eedouble` (doublement EE), `compare` (I contre EE), `tbill` (dernière enchère), `tcalc` (taux d'escompte → rendement), `teq` (équivalent imposable par État), `bondtax` (impôt fédéral), `edu` (Form 8815), `inherit` (bond hérité), `limit` (plafond annuel) |
| `toolArg` | valeurs par défaut pour cette page (clés des champs de la spec), ex. `{ sr: 'EE', fm: 'paper', iy: 1995, im: 6 }`, `{ tm: '52-Week' }`, `{ sx: 'new-york', nyc: 'yes' }` |

## Le kit (règle des chiffres)

```ts
import { KIT as K } from '../../lib/kit';
K.P                         // params-2026.json : K.P.bonds.annualLimitElectronicI, K.P.tax.brackets.single, K.P.education.phaseOut['2026'], K.P.nextIBond…
K.R, K.A                    // rates.json, auctions.json (K.A.built, K.A.latest['13-Week'], K.A.history['26-Week'] = [[auction, investment, discount]…])
K.S('california')           // un État de states.json (name, year, brackets.single/joint, surtax, local, usInterest, sourceUrl…)
K.tool('bond', { sr: 'EE', iy: 2000, im: 1, fm: 'paper', amt: 100 })   // résultat d'un calculateur { label, value, sub, rows, table? }
K.bond(series, '2001-05', K.BUILD, 'paper'|'electronic', amount, project?)   // { ok, value, price, interest, rate, penalty, penaltyCost, cashable, cashFrom, stopped, finalMonth, om, frozen, floor }
K.irate('2022-03', K.BUILD) // { fixed, inflation, rate, start, next, known } (mois = index ; K.month(ymStr) pour écrire)
K.iFixed('2000-05'), K.composite(fixed, inflation), K.next() // { value: inflation du 1er nov., official }
K.periods('I', '2022-01', K.BUILD)  // [['2022-01', 0.0712], …] périodes d'un bond
K.cohorts()                 // I bonds groupés par taux fixe : [{ from, to, fixed, rates }]
K.LAST ('2026-05'), K.NEXT ('2026-11'), K.BUILD (mois du build), K.FINAL_MONTHS
K.bill('26-Week')           // dernière enchère { auction, issue, maturity, discount, investment, price, … } (taux en %)
K.TERMS, K.termLabel(t), K.billBuy(face, discount, days, issue?), K.priceFromDiscount(d, days), K.investmentRate(p, days, y)
K.fed(revenu, 'single'|'joint'|'head') → taux marginal fédéral ; K.fedTax(revenu, st)
K.stateRate(slug, revenu, st, 'nyc'?) → { state, local } ; K.teq(y, f, s, itemize?) ; K.topRate(slug) ; K.NO_TAX (slugs sans impôt sur les intérêts)
K.edu(proceeds, interest, expenses, magi, 'other'|'joint') → { beforePhase, phase, excluded }
K.usd(x) "$1,234" · K.usd2(x) "$1,234.56" · K.pct(0.0426) "4.26 %" · K.pct(x, 3) · K.num · K.dec(x, d) · K.day('2026-11-01') · K.month('2026-11')
```

Dans `body(h)` : tout le kit, plus `h.a(id, texte)` (lien interne ; id inconnu = test en échec, sauf id prévu dans
`planned.ts`), `h.table(entêtes, lignes, légende, alignements)`, `h.src(clé, texte)`, `h.ext(url, texte)`, `h.box(titre, html)`,
`h.mini(kind, { t: 'titre', p: ['ids des champs montrés'], d: { valeurs par défaut } })`.

**Mini-simulateurs (RECETTE §9.3)** : 1 à 3 par page, **au moins un**, sur le sujet du paragraphe qui précède, 1 ou 2 champs
montrés, valeurs propres à la page. Jamais le même mini avec les mêmes valeurs qu'une autre page.

## Ton et unicité

- Anglais américain, voix humaine, phrases de longueur variable, **le chiffre d'abord**. Lecteur : quelqu'un qui a trouvé un
  bond papier dans un tiroir, un épargnant qui a acheté des I bonds en 2022, un retraité qui place sa trésorerie en T-bills,
  un héritier. Expliquer chaque sigle à sa première apparition (CPI-U, MAGI, IRD, BEY).
- Interdits (le test les refuse) : tirets cadratin et demi-cadratin, « it's important to note », « dive into », « delve »,
  « whether you're », « navigate the », « Moreover », « Additionally », « Furthermore », « game changer », « unlock »,
  « guaranteed », « call us ». Pas de triplets en série, pas de conclusion qui résume, pas d'émoji.
- **Unicité** (§6) : `check-unique` compare toutes les pages (texte hors tableaux et calculateurs, chiffres neutralisés,
  seuil 30 %). Titres `h2`/`h3` propres, angle propre, exemples chiffrés propres à la page (mois d'émission et montants
  différents d'une page à l'autre). Ne jamais reprendre une phrase d'une autre page.
- `4.26 %` s'écrit avec `K.pct` ; `10 %` tapé à la main prend une espace (insécable posée au build).

## Contrôles

```bash
cd ~/Documents/GitHub/a-publier/Mottalib-10M/us-savings-bonds
PAGE_FILES=ee-bond-value,state:california npx vitest run tests/pages.test.ts   # tes pages
python3 scripts/sim-pages.py --only ee-bond-value,state:california            # similarité (après le test ci-dessus)
npx vitest run tests/engine.test.ts tests/oracle.test.ts tests/tbill.test.ts   # moteur
```

Serveur local : port **5601** (`npm run preview`), arrêt par le port (`lsof -ti tcp:5601 | xargs kill`), jamais `pkill -f`.
