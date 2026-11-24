# cv-site.js

Script unique des animations des blocs Covalt construits en natif dans Webflow (vanilla JS, sans dépendance).

- Source lisible : `cv-site.js`. Version à publier : `cv-site.min.js` (15,9 Ko, 6,2 Ko gzip, budget 15 Ko).
- Régénérer la version minifiée : `npx terser@5 cv-site.js -c -m --comments '/^!/' -o cv-site.min.js`.
- Sans JS ou avec `prefers-reduced-motion`, la page garde l'état final livré par Webflow.

## Modules (attribut `data-cv-anim`)

| Valeur | Bloc | Lit dans le DOM |
|---|---|---|
| `reveal` | tout élément | `data-cv-delay` (ms) |
| `marquee` | CV Logos (`.cv-marquee`) | 1er enfant = piste, son 1er enfant = groupe dupliqué |
| *(classes)* | FAQ : `.cv-faq-item`, `.cv-faq-question`, `.cv-faq-reponse`, `.cv-faq-icone` | – |
| `rdv` | CV Prise de rendez-vous | `data-cv-url` ; sans `form` : calendrier chargé à l'approche dans `[data-cv-calendrier]` (lien de secours masqué) ; avec `form` : `{email}` remplacé ; recopie utm_* et gclid de la page (+ parentHubspotUrl / parentHubspotUtk) sur l'iframe et les liens `/meetings/` |
| `comparateur` | CV Comparateur garanties | `data-cv-scenarios` = `montant\|durée\|secteur\|mois\|fiducie\|garantie1;…` |
| `process` + `process-ecrans` | CV Process + CV Illustration process | `.cv-process-etape`, `[data-cv-panneau]` |
| `depot-projet` | CV Illustration dépôt de projet | `.cv-depot-*`, `data-cv-liste`, notification `.cv-notif` dans le même `.cv-aplat` |
| *(classe `.cv-tq`)* | CV Témoignages (slides CV Témoignages · Slide) | `.cv-tq-slide`, `.cv-tq-etiquette` (masquée si vide), `.cv-tq-nav` (barres + compteur générés). 1 slide : carte fixe ; 2+ : 7 s/slide, pause survol / appui long, balayage ≥ 40 px, seuil de visibilité 30 % |
| `guide` | Modèle /guide/{slug} (section 01, classes `cv-gd-*`) | `--cv-hd` = hauteur de `.navbar` ; formulaire `[data-cv-hs-form]` (id du formulaire HubSpot, champ CMS form-id-hubspot) envoyé à l'API Forms v3 de HubSpot avec hubspotutk, URL et titre ; question fiduciaire si `data-cv-fidu="Oui"` (champ CMS Question fiduciaire) ; `[data-cv-extrait]` (URL de l'extrait) ; `[data-cv-guide-autres]` : 3 cartes, jamais le guide courant ; JSON-LD BreadcrumbList |
| `guide-logos` | Logos du modèle de guide | 1er enfant = piste, son 1er enfant = groupe ; rangée fixe, défilement 32 s sous 767 px, pause survol / toucher |

Les fenêtres de temps sont codées en dur, selon le README de passation (« Modules d'animation ») et les prototypes (`heroVals()`, `renderVals()`).
