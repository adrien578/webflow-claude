# Bibliothèque de blocs CV (Webflow natif)

Suivi de construction de la bibliothèque de blocs du site Covalt et des LP Loan Connect.
Passation de référence : `design_handoff_loan_connect_lp` (README, prototypes, contenus JSON).
Méthode : éléments Webflow natifs + un seul script `cv-site.js`. Pas de DevLink pour ces blocs.

Site Webflow : Covalt `6878ed604188895c3c22b06d`. Aucune publication : tout est en brouillon.

## Phase 0 : inventaire (15/10/2026)

- Points de rupture : Desktop (base), ≥ 1280, ≥ 1440, Tablet ≤ 991, Mobile L ≤ 767, Mobile ≤ 479.
  La bibliothèque ne pose aucun style sur les paliers 1280 / 1440.
- LP en ligne non touchées : `/loan-connect/lp/refinancement`, `/reprise-entreprises`, `/financement-immo`
  (composants `LC_*`, `Section_*`, `footer_LC_LP`).
- Composants DevLink `Cv*` (groupe « Covalt ») : non utilisés par la bibliothèque.

## Phase 1 : fondations

### Nettoyage
103 classes `cv-*` orphelines (tentative précédente) supprimées, après vérification sur les
50 pages et dans les 35 composants natifs : aucune utilisation.

### Polices (auto-hébergées, woff2 latin)
| Famille | Graisse | ID |
|---|---|---|
| Gerstner Programm | 400 | `68cd08e2862a870abbab4e53` (existante) |
| Inter | 400 | `6ad0d526a94a2937044af1b7` |
| Inter | 500 | `6ad0d53aa94a2937044af9e9` |
| JetBrains Mono | 400 | `6ad0d53b5ba992454303eeab` |
| JetBrains Mono | 500 | `6ad0d53bd75da01251f43d16` |

Gerstner Bold n'est pas utilisé par les prototypes (titres en 400) : non téléversé.

### Variables : collection « Covalt Tokens » (`collection-6d95227a-2bee-900f-f0ee-812faba5ef99`)
| Variable | Valeur | ID |
|---|---|---|
| cv-bleu | #007AA3 | `variable-1f0e6a41-2a7b-5e21-eb5e-e1f994180c6f` |
| cv-bleu-fonce | #005A78 | `variable-08da63a2-02a3-1ae4-899c-62fc99028059` |
| cv-bleu-teinte | #EEF6F9 | `variable-14ccf011-9760-e4c6-9884-29a01ac71923` |
| cv-bleu-bordure | #B8D8E6 | `variable-99ef18cf-367f-6425-fe2d-ef2772ca21a9` |
| cv-bleu-sur-sombre | #8FD0E8 | `variable-0fb25ae9-eed8-5e9e-3be3-dc0452cf61b7` |
| cv-encre | → Black (#081412) | `variable-24e0879b-b6b0-2bc8-89d2-3ea576aad0b8` |
| cv-bone | → background_section (#F5F7F5) | `variable-182a82e9-ee2e-16af-5e76-49a665831481` |
| cv-polar | → Stroke (#DCE2DF) | `variable-54ef4a11-3891-09dd-dca0-60e80ae8cf77` |
| cv-blanc | → White | `variable-5f518323-20c0-0603-c5f2-de6fc8b6e991` |
| cv-vert-fluo | → Light Green (#E0FEB3) | `variable-4fb5bf22-4261-ade5-527c-566323596cf0` |
| cv-texte-secondaire | rgba(8,20,18,.62) | `variable-d3a23214-30af-0dac-5653-863269488c0b` |
| cv-texte-tertiaire | rgba(8,20,18,.40) | `variable-47844f8d-79ac-61cf-2868-f2bfad631836` |
| cv-texte-sur-sombre | rgba(255,255,255,.72) | `variable-1884e59e-c240-ff6b-faaa-cca74851cc80` |
| cv-police-titres | Gerstner Programm | `variable-b74804b9-2c8f-3f61-d3ef-02b552176521` |
| cv-police-texte | Inter | `variable-5efea0d9-cc25-4f6a-ca04-b4517656e4d1` |
| cv-police-mono | JetBrains Mono | `variable-0f352e1a-33e9-a65b-afa7-ce3af3fcfbc5` |
| cv-rayon | 4px | `variable-6e2485de-cfb7-a229-9a57-4bbd71dee17e` |
| cv-rayon-badge | 2px | `variable-8d49925d-1a42-fdb6-2402-258875238dc8` |

### Classes de base
| Classe | Rôle | Mobile (≤ 767) |
|---|---|---|
| `cv-section` | fond bone, bordure basse polar, police texte, couleur encre | |
| `cv-section--blanc` / `--encre` / `--bleu` | fonds (encre et bleu : texte blanc, sans bordure) | |
| `cv-container` | max 1280, padding 112 / 32, flex colonne, gap 56 | padding 64 / 20, gap 36 |
| `cv-h1` | Gerstner clamp(42px,5vw,58px) / 1,04, −.03em, 16ch | 38px / 1,06 |
| `cv-h2` | Gerstner clamp(34px,3.8vw,52px) / 1,06, −.02em, 17ch | 32px |
| `cv-surtitre` (+ `--sombre`, `--blanc`) | mono 12px, .12em, majuscules, bleu | |
| `cv-paragraphe` (+ `--sombre`, `--grand`) | 17px / 1,6, texte secondaire, 52ch | 16px (grand : 17px) |
| `cv-mention` | 13px, texte tertiaire | |

Les titres héritent de la couleur de la section (`color: inherit`), car le style global des
titres du site impose une couleur sombre.

### Page vitrine
« _Bibliothèque » : `/bibliotheque-cv`, brouillon, ID `6ad0d5bbcec62d21b491d695`.

### Notes techniques
- Les « Text Block » créés par l'API n'acceptent pas de texte : utiliser des paragraphes.
- L'API Webflow limite le débit (429) : travailler par lots d'environ 15 actions.
