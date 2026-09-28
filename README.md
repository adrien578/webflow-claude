# Covalt — Homepage v3 en composants DevLink

Composants de code React (TypeScript) importés dans Webflow via **DevLink** (code components) pour la nouvelle homepage Covalt : positionnement « partenaire des prêteurs », offres Loan Connect, Loan Protection et Loan Servicing.

- Site Webflow : **Covalt** (`6878ed604188895c3c22b06d`, `covalt-eu`)
- Librairie DevLink : **Covalt** (`webflow.json`, id `covalt-homepage`), tous les composants dans le groupe « Covalt »
- Référence de design : `design/handoff/` (prototypes HTML desktop et mobile, README de passation). **Les prototypes font foi pour les textes.**

## Démarrage

```bash
npm install
npm run dev            # prévisualisation locale de la homepage complète : http://localhost:5173
npm run typecheck      # vérification TypeScript
npm run webflow:bundle # build DevLink local (dossier dist/), sans rien publier
npm run webflow:share  # build + import de la librairie dans le workspace Webflow
```

`webflow:share` (`webflow devlink import`) demande une authentification Webflow : lancer `npx webflow auth login` une fois, ou fournir `WEBFLOW_API_TOKEN` (token du workspace avec accès au site Covalt).

Pour comparer au prototype, ouvrir `design/handoff/prototype/Covalt Homepage v3.dc.html` (desktop) et `… Mobile.dc.html` (393 px) via un petit serveur HTTP (`python3 -m http.server` dans le dossier). Le prototype charge React depuis unpkg.

## Composants

| Composant | Rôle |
|---|---|
| `CvHeader` | Header sticky (72 px, flou), navigation, menu burger plein écran sous 992 px. Les liens d'offres sélectionnent et verrouillent l'onglet correspondant de `CvOffers`. |
| `CvHero` | Section hero complète : gravure en fond, titre rotatif, paragraphe, 2 CTA. |
| `CvHeroRotator` | Titre h1 seul avec le mot qui glisse (`prefix`, `lead`, `words`, `suffix`, `intervalMs` = 1000). |
| `CvClientsMarquee` | Bandeau « Ils nous font confiance » : défilement infini (40 s), pause au survol, masque en dégradé. |
| `CvOffers` | **Composant principal** : 3 onglets à défilement automatique (9000 ms, ligne de progression 2 px), pause au survol, verrouillage au clic, panneaux texte + illustration. |
| `CvConnectIllustration` | Tableau d'opérations, survol, popup de mise en relation, ouverture automatique après 3 s sans interaction. |
| `CvProtectionIllustration` | Compte séquestre, solde animé, flux de transactions, alerte « Bris de covenant détecté », expert (saisie → message → 2 actions). |
| `CvServicingIllustration` | Tâches d'administration cochées une à une, compteur « x/n traités ». |
| `CvStats` | Chiffres clés avec compteur (0 → valeur, 1600 ms, easeOutCubic) à l'entrée dans l'écran. |
| `CvTechSection` | Section « La technologie Covalt » (fond encre) : titre, schéma, 3 piliers. |
| `CvTechDiagram` | Schéma seul (3 offres → plateforme) avec impulsions animées. |
| `CvStructuroSection` | Section Structuro : texte, badges, CTA et carte animée. |
| `CvStructuroCard` | Carte de démonstration Structuro seule. |
| `CvTestimonials` | Carrousel de témoignages : auto 8 s, pause au survol, flèches 48 × 48, compteur « 01 / 02 », barres cliquables. |
| `CvCta` | Bandeau vert « Parlons de votre prochaine opération. » |
| `CvFooter` | Pied de page (fond encre). |

Tous les textes, liens et images sont des **props éditables** dans le panneau Propriétés, rangées par groupes. Chaque prop a pour valeur par défaut le texte exact du prototype.

### Listes (opérations, tâches, chiffres, témoignages, logos)

DevLink gère mal les tableaux : chaque liste est exposée en entrées numérotées à nombre fixe (`deal1Name` … `deal5Duration`, `task1Title` …, `stat1Value` …, `item1Quote` …, `logo1` …). Une entrée vide (nom, titre ou citation) est masquée. Pour les logos clients, une hauteur de 0 masque le logo. Il reste des emplacements libres : 12 logos, 6 tâches, 4 témoignages.

### Images

Les images du prototype sont **embarquées dans le bundle** et servent de valeur par défaut (DevLink n'accepte pas de valeur par défaut pour une prop Image). Choisir une image dans le Designer remplace l'image embarquée.

### Illustrations dans `CvOffers`

`CvOffers` intègre les trois illustrations animées. Pour en modifier le contenu (opérations, textes de l'alerte, tâches…), poser le composant `CvConnectIllustration`, `CvProtectionIllustration` ou `CvServicingIllustration` dans le slot **Illustration 1/2/3** de l'offre, puis éditer ses props. Un slot vide garde l'illustration intégrée. Une popup Loan Connect ouverte par l'utilisateur met en pause le défilement des onglets (événement `covalt:offers-hold`). L'événement est composé et traverse les Shadow DOM : la coordination est prévue pour fonctionner aussi via les slots, mais c'est à vérifier en recette dans Webflow.

## Assemblage dans le Designer

1. Importer la librairie (`npm run webflow:share`), puis l'installer sur le site Covalt.
2. Créer la page (ne pas réutiliser l'ancienne page brouillon `/homepage-v3` ni les composants `cv-*`, voir le README de passation).
3. Poser `CvHeader`. Si le header ne reste pas collé en haut, appliquer `position: sticky; top: 0; z-index: 50` au bloc parent du composant.
4. Pour chaque section, créer une **Section native avec l'ID d'ancre**, puis y poser le composant :

   | ID de la section | Composant |
   |---|---|
   | `top` | `CvHero` |
   | `clients` | `CvClientsMarquee` |
   | `offres-detail` | `CvOffers` |
   | `chiffres` | `CvStats` |
   | `technologie` | `CvTechSection` |
   | `structuro` | `CvStructuroSection` |
   | `temoignages` | `CvTestimonials` |
   | `contact` | `CvCta` |

   Puis `CvFooter` en bas de page. Les composants sont rendus dans un Shadow DOM : les ancres (`#offres-detail`…) doivent donc être portées par les éléments Webflow, pas par les composants. Ajouter `scroll-margin-top: 72px` sur ces sections et activer le défilement fluide (`html { scroll-behavior: smooth }`) dans le code personnalisé du site.
5. Fond de page : `#F5F7F5`.
6. Publier sur `covalt-eu.webflow.io` pour la recette avant covalt.eu.

`CvHeroRotator`, `CvTechDiagram` et `CvStructuroCard` servent si l'on préfère construire la section en éléments natifs et n'y insérer que la partie animée.

## Architecture

```
src/
  styles/tokens.css        tokens de la charte (sur :host et :root), resets à spécificité nulle, primitives partagées
  lib/                     hooks (visibilité, reduced-motion, apparitions, minuteries), polices, événements, helpers de props
  components/Cv*/          Composant.tsx + Composant.module.css + Composant.webflow.tsx (déclaration DevLink)
  components/shared/       aplat de couleur + carte des illustrations
  assets/                  images et polices du prototype
dev/                       page de prévisualisation locale (Vite), assemblée comme dans le Designer
design/handoff/            passation de design (prototypes, tokens, README)
```

- **Styles isolés** : CSS Modules par composant, importés en `import * as styles` (la CLI Webflow expose des exports nommés). Les tokens sont déclarés sur `:host`, ce qui rend chaque composant indépendant du CSS du site.
- **Polices** : les `@font-face` ne s'appliquent pas dans un Shadow DOM. `src/lib/fonts.ts` injecte donc une fois dans le `<head>` Gerstner Programm FSL (fichiers embarqués, licence FontStand) ainsi qu'Inter et JetBrains Mono (Google Fonts).
- **Minuteries** : toutes sont nettoyées au démontage et mises en pause quand le composant n'est pas visible (IntersectionObserver). Les défilements (onglets, témoignages) utilisent une horloge pausable, synchronisée avec la barre de progression CSS.
- **Accessibilité** : `prefers-reduced-motion` coupe les boucles et affiche le contenu immédiatement. Les onglets suivent le modèle ARIA `tablist` (flèches, Début, Fin). Les lignes d'opérations sont activables au clavier (Entrée, Espace). Échap ferme la popup et le menu.
- **SSR** : rendu serveur actif (défaut Webflow). Aucune API navigateur n'est utilisée pendant le rendu, et les dates sont calculées côté client.

## Points d'attention avant la mise en production

- **Logos** : les logos clients et les logos des témoignages ont été découpés dans des captures d'écran. Il faut les remplacer par les fichiers vectoriels officiels (props Image).
- **Photo d'Arthur Bertin** à fournir (prop `expertPhoto` de `CvProtectionIllustration`). Sans photo, des initiales s'affichent.
- **Bandeau clients** : le README de passation indique « fond blanc », mais le prototype (qui fait foi) l'affiche sur le fond de page `#F5F7F5`. C'est le rendu du prototype qui a été repris.
- **Polices** : si Gerstner, Inter et JetBrains Mono sont ajoutées au site Webflow sous les mêmes noms, l'injection automatique devient simplement redondante.
