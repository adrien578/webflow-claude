# cv-site.js

Script unique des animations des blocs Covalt construits en natif dans Webflow (vanilla JS, sans dépendance).

- Source lisible : `cv-site.js`. Version à publier : `cv-site.min.js` (15,2 Ko, 5,9 Ko gzip, budget 15 Ko).
- Régénérer la version minifiée : `npx terser@5 cv-site.js -c -m --comments '/^!/' -o cv-site.min.js`.
- Sans JS ou avec `prefers-reduced-motion`, la page garde l'état final livré par Webflow.

## Modules (attribut `data-cv-anim`)

| Valeur | Bloc | Lit dans le DOM |
|---|---|---|
| `reveal` | tout élément | `data-cv-delay` (ms) |
| `marquee` | CV Logos (`.cv-marquee`) | 1er enfant = piste, son 1er enfant = groupe dupliqué |
| *(classes)* | FAQ : `.cv-faq-item`, `.cv-faq-question`, `.cv-faq-reponse`, `.cv-faq-icone` | – |
| `rdv` | CV Prise de rendez-vous | `data-cv-url` (`{email}` remplacé), `form`, `input[type=email]` ; recopie utm_* et gclid de la page (+ parentHubspotUrl / parentHubspotUtk) sur l'iframe et les liens `/meetings/` |
| `comparateur` | CV Comparateur garanties | `data-cv-scenarios` = `montant\|durée\|secteur\|mois\|fiducie\|garantie1;…` |
| `process` + `process-ecrans` | CV Process + CV Illustration process | `.cv-process-etape`, `[data-cv-panneau]` |
| `depot-projet` | CV Illustration dépôt de projet | `.cv-depot-*`, `data-cv-liste`, notification `.cv-notif` dans le même `.cv-aplat` |

Les fenêtres de temps sont codées en dur, selon le README de passation (« Modules d'animation ») et les prototypes (`heroVals()`, `renderVals()`).
