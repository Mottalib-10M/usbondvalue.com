# Données de US Bond Value (us-savings-bonds) : d'où elles viennent, comment les refaire

Toutes les valeurs affichées sortent de quatre fichiers de `src/data/`, chacun refait par un script
rejouable. Rien n'est saisi à la main dans le code ni dans les pages (`CONTRIBUTING-PAGES.md`).

| Fichier | Contenu | Script | Source |
|---|---|---|---|
| `rates.json` | taux fixes et d'inflation des I bonds depuis septembre 1998, taux EE de 1980 à aujourd'hui | `python3 -I scripts/data/build-rates.py` | TreasuryDirect : classeur `series-i-ussb-interest-rate-history.xlsx` et pages des taux EE |
| `frozen.json` + `tests/fixtures/oracle.json` | valeurs finales des bonds arrêtés ; 93 786 valeurs de contrôle (291 tables, mars 1999 à mai 2023) | `python3 -I scripts/data/build-oracle.py` | Fiscal Data, API `v2/accounting/od/redemption_tables` |
| `auctions.json` | dernière enchère de chaque bill, historique, enchères annoncées ; jeu de test 2023-2024 (652 enchères) avec `--fixture` | `node scripts/data/build-auctions.mjs` | Fiscal Data, API `v1/accounting/od/auctions_query` |
| `states.json` | barèmes 2026 (ou dernier publié) des 50 États et de DC, impôts locaux NYC, Portland, comtés du Maryland | `python3 scripts/data/merge-states.py` | `research/states/{A,B,C,D}.json`, relevés sur le site de chaque administration fiscale (URL et date dans chaque ligne) |
| `params-2026.json` | règles (unités, délais, plafonds), barème fédéral 2026, exclusion études, exemples IRS, CPI-U, sources | à la main, chaque valeur avec sa clé de source | IRS, TreasuryDirect, eCFR, BLS |

Après toute mise à jour : `npx vitest run` (le moteur doit retomber au cent près sur les 93 786 valeurs et les
652 enchères), puis `npm run build` et les contrôles de la recette.

## Le 1er novembre 2026 (et chaque 1er mai, 1er novembre)

Le Trésor annonce le nouveau taux composite des I bonds et le taux des EE vers 10 h (heure de l'Est). Le même jour :

1. Remplir dans `params-2026.json` : `nextIBond.fixed` et `nextIBond.inflation` (décimaux, ex. 0.009 pour 0,90 %).
   Les pages `next-i-bond-rate` et le calculateur `inext` passent aussitôt de « announced November 1, 2026 » au taux officiel.
2. Relancer `python3 -I scripts/data/build-rates.py` (supprimer d'abord `.cache-raw/rates/` pour forcer le
   téléchargement). `LAST_ANNOUNCED` avance de six mois tout seul et les valeurs de novembre 2026 à avril 2027
   deviennent calculables.
3. Préparer l'annonce suivante : dans `nextIBond`, mettre `date` 2027-05-01, `periodFrom` 2027-05, `fixed` et
   `inflation` à `null`, `cpiMarch` = CPI-U de septembre 2026, `cpiSeptember` = CPI-U de mars 2027 quand le BLS le publie.
4. Relire les pages qui nomment la fenêtre en cours (« May to October 2026 », « until the end of October ») :
   `grep -rn "October 2026\|May to October\|November 1, 2026" src/content src/components`.
5. `npx vitest run`, build, contrôles, commit.

## Enchères de T-bills

`build-auctions.mjs` lit les enchères des 13 derniers mois et les enchères annoncées. À relancer avant chaque
build (une tâche planifiée hebdomadaire suffit : les bills de 4 à 26 semaines sont adjugés chaque semaine).
Les descriptions de pages contiennent des taux calculés : `check-snippets` bloque si une longueur sort de 150-160.

## Barèmes d'État

Californie, Idaho et Vermont utilisent le barème 2025 (le 2026 n'était pas publié le 19 octobre 2026 ; l'Ohio est passé au barème 2026 de la R.C. 5747.02, taux unique de 2,75 % au-dessus de 26 050 $).
Quand il paraît : corriger la ligne dans `research/states/*.json` (barème, `year`, `sourceUrl`, `retrieved`),
relancer `merge-states.py`. Non modélisés (signalés dans les pages) : recapture de New York, NIIT du Minnesota,
pertes de tranches du Connecticut, crédits.

## Réutilisation des données

- **Fiscal Data** (Bureau of the Fiscal Service) : données publiques du gouvernement fédéral, réutilisables
  librement, sans clé d'API. Citer la source (« Fiscal Data, U.S. Department of the Treasury ») et la date de lecture,
  ce que fait chaque tableau. Ne pas appeler l'API depuis le navigateur : les données sont lues au build.
- **TreasuryDirect, IRS, eCFR, U.S. Code, BLS** : œuvres du gouvernement fédéral, hors droit d'auteur aux
  États-Unis. On reprend les chiffres et les règles, jamais le texte mot pour mot, et on ne laisse jamais croire que
  le site est celui du Trésor ou de l'IRS.
- **Sites des États** : chiffres seulement (barèmes), avec l'URL et la date dans `states.json`.
