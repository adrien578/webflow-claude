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

## Phase 2 : éléments (en cours)

### Icônes de cartes (assets SVG, trait 1,5, #007AA3)
| Fichier | Asset ID | Utilisation |
|---|---|---|
| cv-icone-balance.svg | `6ad0dcf57e2f9d3109266c18` | Restructuration de dette |
| cv-icone-refresh.svg | `6ad0dd2a6952d19e86b2b122` | Refinancement |
| cv-icone-users.svg | `6ad0dd2d67287399eedbffb6` | Un réseau diversifié, MBO |
| cv-icone-dossier.svg | `6ad0dcf67f5fcd0f5a690565` | Un dossier renforcé |
| cv-icone-rapide.svg | `6ad0dd2994fe777334e987bd` | Un processus rapide |
| cv-icone-mbi.svg | `6ad0dd2882deca68e35c4eef` | Reprise externe (MBI) |
| cv-icone-obo.svg | `6ad0dd29d9dc408fb8aa6330` | Réorganisation du capital (OBO) |
| cv-icone-croissance.svg | `6ad0dcf6220fab9abc1493e7` | Croissance externe |
| cv-icone-immeuble.svg | `6ad0dcf73069324fdde5298c` | Acquisition long terme |
| cv-icone-marchand.svg | `6ad0dcf75b28c01af07fb6bd` | Marchands de biens |
| cv-icone-relais.svg | `6ad0dd2c388422e67934acaf` | Crédit relais (bridge) |
| cv-icone-atypique.svg | `6ad0dcf53069324fdde527eb` | Opérations atypiques |

Le code d'un embed HTML ne peut pas être lié à une prop : les icônes de cartes passent donc
par une prop Image. La flèche du bouton et la coche des puces restent en embed (currentColor).

### Composants (groupe « Covalt / Éléments »)
| Composant | ID | Props | Variantes |
|---|---|---|---|
| CV Bouton | `e0f40d7d-88e8-794e-7487-931bac29e8ce` | Libellé, Lien, Icône flèche | Primaire (base), Secondaire, Contour clair, Lien |
| CV CTA + mention | `65f033fb-33d2-cb51-495a-90544fc70b9f` | Libellé, Lien, Mention | – |
| CV Surtitre | `2e82a713-b034-10a9-3342-1f1780b1f4b2` | Texte | Clair (base), Sombre, Blanc |
| CV Carte | `d98ae46c-2520-d562-7437-a1149d13a411` | Icône (image), Titre (h3), Texte | Opération (base), Tuile |
| CV Chiffre clé | `f012afa4-9d4e-39b2-5576-955e3114120e` | Valeur, Libellé | – |
| CV Puce | `d159b185-a69e-3af6-775f-5281d7a00cfb` | Texte | Clair (base), Sombre |

Classes ajoutées : `cv-bouton`, `cv-bouton-icone`, `cv-cta`, `cv-carte`, `cv-carte-tete`, `cv-carte-icone`,
`cv-carte-titre`, `cv-carte-texte`, `cv-chiffres` (conteneur), `cv-chiffre`, `cv-chiffre-valeur`,
`cv-chiffre-libelle`, `cv-puce`, `cv-puce-icone`. Variables ajoutées : `cv-voile-blanc`, `cv-trait-encre`.

- Bouton et CTA : pleine largeur et 52 px sous 767 px (sauf variante Lien).
- Chiffres : séparateurs et largeurs (10ch / 19ch) gérés par `:first-child` / `:last-child` dans `cv-chiffres`.

## Phase 3 : sections (terminée, en attente de validation)

### CMS
- Collection **FAQ** `6ad0def2782052c2bc55a57b` : Question (champ Name), Réponse (texte riche), Page (option :
  lp-refinancement `ff0518f35c5edc055e7b6e93e8f84abc`, lp-reprise `5d87018af8a521b646bf2e5125754d25`,
  lp-immobilier `4ffc60ba8f8b4071d15f0ad6025cf607`), Ordre (nombre). 18 questions importées (6 par LP),
  prêtes à publier mais non publiées.
- Écart README : un élément par couple page/question (au lieu d'un multi-option), car les questions
  communes ont des réponses et des rangs différents selon la LP.
- La page modèle « FAQ Template » (`/faq/...`) créée automatiquement est passée en brouillon.

### Assets
| Fichier | Asset ID |
|---|---|
| cv-logo-loan-connect.png | `6ad0e0e11a8cee5f6a2cf105` |
| gravure hero (existante) | `6aba8ca12422d438e831744b` |
| cv-preteur-eurazeo | `6ad0e0e150bc6ba376c32bb4` |
| cv-preteur-bpce-lease | `6ad0e0e17174f1f2e6031d5a` |
| cv-preteur-arkea | `6ad0e0e13a21c9e271fe0b83` |
| cv-preteur-o2capital | `6ad0e10c2358cfdae21bcc2b` |
| cv-preteur-sanso | `6ad0e10ce66a29a00d8ada3b` |
| cv-preteur-elvest | `6ad0e0e14e48b439929aad28` |
| cv-preteur-raizers | `6ad0e10c22ea77dea2581b79` |
| cv-preteur-tylia | `6ad0e10cbdd74aa9e8559127` |
| cv-preteur-mcapital | `6ad0e10c9ca4921aa9c48fa8` |

### Composants (groupe « Covalt / Sections »)
| Composant | ID | Props / slots | Variantes |
|---|---|---|---|
| CV Intro de section | `f2915a7b-de2a-ec95-b0ea-8c349fcf7081` | Surtitre, Titre, Texte, Texte visible | 2 colonnes, Empilée, Sombre |
| CV Grille de cartes | `9c0c2bce-f348-830c-4b81-b60bd8fb1b40` | Ancre, Surtitre, Titre, Texte, CTA visible ; slots Cartes, CTA | Opérations (blanc), Tuiles (bone) |
| CV Header Loan Connect | `01a5fa7b-d264-6e84-339a-59499f60c4a4` | Lien CTA, Libellé CTA | – |
| CV Footer Loan Connect | `3ed80558-7639-4856-d48e-aca05d53c4ff` | – | – |
| CV Logos | `ae918eff-851e-9cdb-2b38-9880696ecdd9` | Libellé ; slot Logos | – |
| CV Logo (élément) | `93854efe-8edd-2e44-ffe3-0ddeea569340` | Image, Nom du prêteur | – |
| CV Témoignage | `634143ce-5376-2cb8-44ea-250748353674` | Visibilité, Surtitre, Citation, Nom, Contexte | – |
| CV Tarifs | `da381327-08f9-3b8c-bd9f-a7e1d8d983c1` | 13 props groupées | – |
| CV Prise de rendez-vous | `8918ad09-40e1-9f9a-f9e1-cb294ebe23f6` | Ancre, Surtitre, Titre, Texte, Libellé lien, Lien, URL calendrier (JS), URL page de réservation | – |
| CV Section 2 colonnes | `d6f2a6f1-bbb4-c50c-9934-f2405cf0f888` | Ancre ; slots Texte, Illustration | Bone, Blanc, Encre, Bleu, Bone · illu. à gauche, Blanc · illu. à gauche |
| CV Illustration sur aplat | `15edc366-b30e-74ee-198b-40e58f6cbbdb` | slots Carte, Notification | Standard, Hero |
| CV Hero | `5363a5d9-22fe-537f-a9f5-7d61627c1fbf` | Ancre, Pastille, Icône pastille, Titre avant/accent/après, Sous-titre, Mention, Gravure ; slots Boutons, Chiffres, Illustration | – |
| CV Process | `08b9ddbc-efd8-4524-6fcf-0bc8bbbcd328` | Ancre, Surtitre, Titre, 4 × (titre, texte) ; slots Actions, Illustration | – |
| CV Security Package | `44499a7e-537d-225c-8162-43b1d069f392` | Ancre, Surtitre, Titre, Paragraphe 1, Paragraphe 2 ; slots Puces, Carte | – |

### Composants (groupe « Covalt / Illustrations »)
| Composant | ID | Props | Notes |
|---|---|---|---|
| CV Illustration dépôt de projet | `d6037ab4-f82c-34b9-1def-a70fa89e60d3` | Montant, Durée, Objet, Secteur, Résumé, Option 1/2 + coûts | État final ; formulaire replié (`cv-depot-form`, 0fr) pour le module `depot-projet` |
| CV Notification | `b8571935-9eec-733f-5106-65c805b811a5` | Initiales, Auteur, Début en gras, Suite du message | – |
| CV Illustration process | `0ab72229-59fc-ce91-0f1a-7f6df9e360b1` | Objet, Documents 1-3, Garantie recommandée, Résumé du projet | 4 écrans `data-cv-panneau` ; 2 à 4 en `cv-pp--cache` sans JS |
| CV Comparateur garanties | `1f8f3e1a-54a0-20d0-fb16-384b80eade7a` | 1er scénario (montant, durée, secteur, garantie 1, coûts, totaux) + Scénarios (JS) | Attribut `data-cv-scenarios` : `m\|d\|secteur\|mois\|fiducie\|garantie1;…` (l'API refuse les guillemets) |

### Attributs lus par cv-site.js
- `data-cv-anim` : `rdv`, `depot-projet`, `process`, `process-ecrans`, `comparateur` (+ `reveal`, `marquee`, `faq` prévus).
- `data-cv-url` (rdv, `{email}` remplacé), `data-cv-liste` (champ en liste déroulante), `data-cv-etape`, `data-cv-panneau`, `data-cv-scenarios`.

### Nouveaux tokens et assets
- Variables : `cv-bleu-teinte-clair` #F4F9FB (`variable-20794363-84e5-fecc-5fb5-b039f7e4f78d`), `cv-bleu-trait` #DCE8EE (`variable-cd898c9e-855f-0a81-22f4-ccd0fd684b1e`).
- Icônes de pastille (#005A78) : refinancement `6ad0e76c4a7f33840ea3e3d0`, reprise `6ad0e76c5a866bda5905a839`, immobilier `6ad0e76cd89e98ffd3f595df`.

### Responsive
- Mobile (≤767) : hero 40/56 px, gravure 115 % à .22, boutons empilés, chiffres en liste (valeur à gauche, libellé à droite), aplat qui déborde jusqu'au bord (−20 px), notification en bas pleine largeur, carte RDV 28/20, process titres 21 px.
- La grille 2 colonnes reste en `auto-fit` (420 / 380 px) : bascule naturelle sous ~900 px ; les variantes « illustration à gauche » repassent à l'ordre normal en mobile.

### Reste à faire / limites
- Tri et filtre de la liste CMS FAQ : refusés par l'API (erreur MPS « Conflict… component map ») ; à régler dans le Designer (filtre Page = …, tri Ordre croissant).
- Captures d'écran : impossibles tant que le Designer n'est pas au premier plan.

- Un slot Webflow se rend en `div` : le slot porte lui-même la classe de mise en page (`cv-grille`,
  `cv-rangee`, `cv-marquee-groupe`) pour que les enfants soient des items flex directs.
- `-webkit-mask-image` refusé par l'API : seul `mask-image` est posé (Safari < 15.4 sans fondu).

## Correctifs après la phase 3
- Les éléments décoratifs vides (carrés de niveau, barres, points, trait du Security Package, barre d'étape du Process) s'affichaient en gros blocs dans le Designer (taille de remplissage des éléments vides) et un `span` vide ne prend pas sa taille. Ils sont remplacés par des HtmlEmbed portant les mêmes classes (51 éléments dans CV Illustration dépôt de projet, CV Notification, CV Illustration process, CV Process, CV Comparateur garanties).

## Phase 4 : cv-site.js (en attente de validation)
- Fichiers : `cv-site/cv-site.js` (source), `cv-site/cv-site.min.js` (14,6 Ko, 5,7 Ko gzip), `cv-site/README.md`.
- Testé dans Chromium (Playwright) sur un balisage équivalent : aucun message d'erreur ; états corrects avec et sans `prefers-reduced-motion`.
- Rien n'est encore ajouté au code personnalisé du site.
