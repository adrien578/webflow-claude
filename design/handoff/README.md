# Passation : homepage Covalt v3 en composants de code Webflow (DevLink)

## Objectif
Construire la nouvelle homepage Covalt (positionnement « partenaire des prêteurs » avec trois offres : Loan Connect, Loan Protection et Loan Servicing) sous forme de **composants de code React importés dans Webflow via DevLink**. Webflow reste l'outil d'hébergement, de CMS et de mise en page. Les sections animées, que Webflow ne sait pas produire nativement, deviennent des composants React posés dans le Designer, avec des propriétés modifiables par l'équipe marketing.

Site Webflow : **Covalt** (`6878ed604188895c3c22b06d`, short name `covalt-eu`, domaine covalt.eu).

## À propos des fichiers de design
Les fichiers de `prototype/` sont des **références de design en HTML** : des prototypes qui montrent le rendu et le comportement attendus. Ce n'est pas du code de production à copier tel quel. Il faut **recréer ces designs en composants React (TypeScript) compatibles DevLink** en suivant les conventions DevLink : props déclarées, styles isolés (CSS Modules ou équivalent), pas de dépendance globale.

- Ouvrir `prototype/Covalt Homepage v3.dc.html` dans un navigateur pour la version desktop, et `prototype/Covalt Homepage v3 Mobile.dc.html` pour la version mobile (393 px).
- Le texte et le balisage se trouvent dans `<x-dc>…</x-dc>`, la logique dans `<script type="text/x-dc">` (classe `Component`, méthode `renderVals()`).
- **Les prototypes font foi pour les textes.** La tentative précédente de construction directe dans Webflow (page `/homepage-v3` en brouillon et composants `cv-*`) a simplifié les textes et comporte des bugs. **Ne pas la réutiliser** : la supprimer, ou la garder uniquement comme brouillon.

## Fidélité
**Haute fidélité (hifi).** Couleurs, typographie, espacements et interactions sont définitifs. Il faut reproduire le rendu au pixel près et respecter les durées et courbes d'animation indiquées.

## Architecture cible (DevLink)
Composants de code à créer (groupe « Covalt ») :

| Composant | Rôle | Props principales (éditables dans Webflow) |
|---|---|---|
| `CvHeroRotator` | Titre du hero avec le mot qui glisse | `prefix` (« Le partenaire des prêteurs »), `words` (liste : sourcer, sécuriser, administrer), `suffix` (« leurs financements. »), `intervalMs` (1000) |
| `CvClientsMarquee` | Bandeau de logos en défilement infini | `label`, `logos` (slot ou liste d'images), `durationS` (40), pause au survol |
| `CvOffers` | Onglets et panneaux des 3 offres (composant principal) | `tabMs` (9000), puis pour chaque offre : `eyebrow`, `logo`, `subtitle`, `color`, `title`, `body`, `bullets[4]`, `ctaLabel`, `ctaHref` |
| `CvConnectIllustration` | Tableau d'opérations interactif et popup de mise en relation | `deals[]` (nom, objet, montant, sûreté, durée), `autoOpenDelayMs` (3000) |
| `CvProtectionIllustration` | Compte séquestre, flux de transactions et alerte de l'expert | `expertName` (Arthur Bertin), `expertRole`, `expertPhoto`, `alertTitle`, `alertText`, `actionPrimary`, `actionSecondary` |
| `CvServicingIllustration` | Tâches d'administration cochées une à une | `tasks[]` |
| `CvStats` | Chiffres clés avec compteur | `stats[]` (préfixe, valeur, unité, description) |
| `CvTechDiagram` | Schéma de la plateforme avec impulsions animées | textes des 5 modules |
| `CvStructuroCard` | Carte de démonstration Structuro animée | champs de l'opération |
| `CvTestimonials` | Carrousel de témoignages | `items[]` (citation, nom, société, logo, badge d'offre), `intervalMs` (8000) |

Les sections statiques (header, footer, CTA vert, titres de section) peuvent rester en **éléments Webflow natifs**, construits dans le Designer, qui accueillent les composants de code ci-dessus. Si c'est plus simple, tout peut aussi être en composants de code.

Pour les listes (deals, stats, témoignages), DevLink gère mal les tableaux en props. Deux solutions : exposer un nombre fixe d'entrées (`deal1Name`, `deal1Amount`…), ou passer par des **slots** Webflow ou une **Collection CMS** (recommandé pour les témoignages et les logos clients).

## Écrans et sections (desktop 1280 px, max-width du conteneur 1280, padding latéral 32 px)
L'ordre suit le prototype v3.

1. **Header** (sticky, fond `rgba(245,247,245,0.86)` + `backdrop-filter: blur(12px)`, bordure basse `#DCE2DF`, hauteur 72 px)
   - Logo Covalt (SVG, hauteur 22 px).
   - Navigation : Loan Connect, Loan Protection, Loan Servicing, Technologie, Structuro.
   - Boutons : « Connexion » (secondaire) et « Obtenir une proposition » (fond `#081412`, texte blanc, rayon 4 px, hauteur 40 px).
   - Mobile : menu burger en plein écran (voir la maquette mobile).
2. **Hero** (fond `#F5F7F5`, padding 120 px 32 px 128 px)
   - Gravure `frame-engraving-banner.png` en arrière-plan à droite (largeur 62 %, opacité 0,55, `mix-blend-mode: multiply`).
   - Titre en Gerstner Programm, `clamp(46px, 6.4vw, 92px)`, interligne 1,02, letter-spacing -0,03em, avec le mot rotatif en `#24826B`.
   - Paragraphe de 19 px, interligne 1,55, max 56ch.
   - Deux CTA de 48 px.
3. **Bandeau clients** (fond blanc, padding 40 px)
   - Libellé « Ils nous font confiance » suivi de 9 logos : hauteur 16 à 44 px selon le logo, opacité 0,72, espacement 88 px.
   - Masque en dégradé sur les bords (8 %) et défilement infini de 40 s.
4. **Offres** (padding 112 px 32 px 128 px)
   - Titre de section et sous-titre.
   - 3 onglets en grille de 3 colonnes, chacun avec : ligne de progression de 2 px en haut, eyebrow mono (« 01 — Sourcer »), logo de l'offre, sous-titre de 14 px.
   - Panneau en grille de 2 colonnes (gap 80 px) : à gauche le texte et 4 puces numérotées, à droite l'illustration posée sur un aplat de la couleur de l'offre (padding 40 px 0 40 px 40 px, carte débordant de 24 px à droite, ombre `--shadow-4`).
5. **Chiffres / Expertise** : fond blanc, 4 chiffres (Gerstner 60 px, unité 30 px verte), bordure gauche de 1 px.
6. **Technologie** : fond `#081412`, schéma de la plateforme animé et 3 colonnes (Détection en temps réel, Transparence totale, Action immédiate).
7. **Structuro** : texte, badge « GRATUIT · PROPULSÉ PAR L'IA » et carte de démonstration animée.
8. **Témoignages** : carrousel de 2 témoignages (Seven Partners – Yvan Gouchon – Loan Protection ; O2 Capital – Charly Abessolo – Plateforme Covalt). Textes exacts dans le prototype.
9. **CTA** : fond `#24826B`, « Parlons de votre prochaine opération. »
10. **Footer** : fond `#081412`.

La version mobile (393 px) est détaillée dans `Covalt Homepage v3 Mobile.dc.html` : onglets empilés, illustrations sur toute la largeur, CTA sur toute la largeur, grille de chiffres en 2 colonnes, etc.

## Interactions et comportements (critique)
- **Mot rotatif du hero** : il change toutes les 1000 ms. Chaque mot est superposé aux autres (`grid-area: 1/1`) : le mot actif est en `translateY(0)`, le précédent sort à `-105%`, le suivant attend à `105%`. Transition `transform 520ms cubic-bezier(.3,0,0,1)` et `opacity 400ms`.
- **Onglets d'offres** :
  - Défilement automatique toutes les 9000 ms, avec une ligne de progression de 2 px dans la couleur de l'offre (animation `scaleX` 0→1, linéaire).
  - Pause au survol de la section.
  - **Au clic sur un onglet, il est verrouillé** : plus de défilement automatique et ligne pleine.
  - Onglet inactif : logo et typographie en `grayscale(1)` avec une opacité de 0,45. Onglet actif : logo en couleurs réelles et eyebrow dans la couleur de l'offre.
  - À chaque changement d'onglet, le fond de l'illustration prend la couleur de l'offre et le panneau entre en fondu ascendant.
  - Couleurs : Connect `#007AA3`, Protection `#24826B`, Servicing `#8A8A6A` (texte de l'eyebrow Servicing `#6B6B4F`).
- **Loan Connect** :
  - Survol d'une ligne : fond `#E8F3F7`.
  - Clic sur une ligne : popup dans la carte (voile `rgba(8,20,18,.32)`, carte blanche de 360 px max, avec nom, objet, montant, durée et sûreté), bouton « Demander une mise en relation » (`#007AA3`). Après clic, le bouton est remplacé par « ✓ Demande transmise à l'équipe Covalt. ».
  - **Si l'utilisateur n'interagit pas**, l'illustration ouvre seule une opération au bout de 3 s, la referme après 4,5 s puis passe à la suivante. Le premier survol de la carte arrête ce déroulé automatique.
  - Tant qu'une popup ouverte par l'utilisateur est affichée, le défilement des onglets est en pause.
- **Loan Protection** :
  - Compte séquestre avec un solde qui s'anime, un seuil d'alerte à 150 000 € et un flux de transactions qui arrivent une par une.
  - Alerte « Bris de covenant détecté », avec un point qui pulse.
  - Arthur Bertin (photo et rôle) montre d'abord l'indicateur de saisie (3 points), puis le message, puis 2 boutons : « Demander l'activation de la sûreté » et « Échanger avec l'emprunteur ».
- **Loan Servicing** : liste de tâches cochées une à une, avec un compteur « x/n traités ».
- **Chiffres** : compteur de 0 à la valeur finale en 1600 ms (easeOutCubic), déclenché lorsque la section entre dans l'écran.
- **Apparitions au scroll** : `opacity 0→1` et `translateY(24px→0)`, durée 900 ms, courbe `cubic-bezier(.2,0,0,1)`, décalage de 90 ms entre éléments frères.
- **Témoignages** :
  - Défilement automatique toutes les 8 s, pause au survol.
  - Navigation par flèches de 48×48 px, compteur « 01 / 02 » et barres de progression cliquables.
  - Transition : fondu de 600 ms combiné à `translateY(24px)`.
- **Accessibilité** : respecter `prefers-reduced-motion` (couper les boucles et rendre le contenu visible immédiatement) et rendre les onglets et les lignes accessibles au clavier.

## État (par composant)
- `CvOffers` : `tab`, `locked`, `paused` (survol), `cycleKey` (pour relancer la barre de progression).
- `CvConnectIllustration` : `selected` (index ou null), `autoMode`, `touched`, `requested`.
- `CvProtectionIllustration` : `stage` (feed → alert → typing → message), `transactions[]`.
- `CvTestimonials` : `index`, `paused`.

Toutes les minuteries doivent être nettoyées au démontage du composant et mises en pause lorsque le composant n'est pas visible (IntersectionObserver).

## Design tokens
Source : `prototype/_ds/covalt-design-system-013b27b1-bdaa-4f23-aa8b-cefdfb247664/tokens.css`.
- **Couleurs**
  - Encre `#081412`, fond « bone » `#F5F7F5`, blanc `#FFFFFF`, filets `#DCE2DF`.
  - Vert `#24826B` (survol `#1E6E5A`, `#18594A`, `#C2E0D6`, `#E8F4F0`), vert clair `#E0FEB3`, vert clair doux `#EFFFD8`.
  - Texte secondaire `rgba(8,20,18,.62)`, texte tertiaire `rgba(8,20,18,.40)`.
  - Couleurs des offres : Connect `#007AA3`, Protection `#24826B`, Servicing `#8A8A6A`.
- **Typographie**
  - Titres : **Gerstner Programm FSL** (licence FontStand, fichiers dans `_ds/.../fonts/`), avec repli sur Georgia.
  - Texte : **Inter** (400, 500, 600, 700).
  - Mono (eyebrows, chiffres) : JetBrains Mono, SF Mono, Menlo.
  - Letter-spacing global -0,005em. Eyebrows en mono 11-12 px, letter-spacing 0,1-0,12em, en capitales.
- **Rayons** : 0 partout, 4 px sur les boutons et champs, pilule (999 px) sur les badges.
- **Ombres**
  - `--shadow-3` : `0 8px 24px rgba(8,20,18,.08), 0 0 0 1px rgba(8,20,18,.05)`
  - `--shadow-4` : `0 24px 48px rgba(8,20,18,.12), 0 0 0 1px rgba(8,20,18,.06)`
- **Courbes d'animation** : standard `cubic-bezier(.2,0,0,1)`, emphase `cubic-bezier(.3,0,0,1)`.
- **Espacements** : échelle de 4 pt (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128).
- **Points de rupture** : desktop ≥ 1280 px, tablette ≤ 991 px, mobile ≤ 767 px (maquette à 393 px). Ce sont les points de rupture Webflow.

## Images
Dans `prototype/assets/`, déjà téléversées dans la bibliothèque d'images Webflow :

| Fichier | Asset ID Webflow |
|---|---|
| `covalt-wordmark.svg` | `6aba8c9dd28166bf4248d073` |
| `frame-engraving-banner.png` | `6aba8ca12422d438e831744b` |
| `offers/loan-connect.png` | `6aba8c96307cbc5c681cb5ef` |
| `offers/loan-protection.png` | `6aba8c99beebfb4a651dc4fd` |
| `offers/loan-servicing.png` | `6aba8c9c9e1710e39aae0e90` |
| `logo-sevenpartners.png` | `6aba8c9fd28166bf4248d176` |
| `logo-o2capital.png` | `6aba8cd63fb03220a769a39d` |
| `clients/*.png` (9 logos) | `cv-client-*` dans la bibliothèque d'images |

⚠️ Les logos clients et les logos des témoignages ont été **découpés dans des captures d'écran**. Il faut les remplacer par les fichiers vectoriels officiels avant la mise en production. La photo d'Arthur Bertin est à fournir.

## Fichiers
- `prototype/Covalt Homepage v3.dc.html` : référence desktop et tablette, comportements complets.
- `prototype/Covalt Homepage v3 Mobile.dc.html` : référence mobile 393 px.
- `prototype/support.js`, `prototype/image-slot.js` : scripts nécessaires pour ouvrir les prototypes (ne pas réutiliser).
- `prototype/_ds/…` : tokens et polices de la charte Covalt.
- `prototype/assets/` : images.

## Étapes suggérées pour Claude Code
1. Initialiser un projet DevLink (`npx webflow devlink` / Webflow CLI) relié au site Covalt.
2. Créer les tokens (variables CSS) et déclarer les polices.
3. Développer les composants dans cet ordre : `CvOffers` avec ses 3 illustrations, puis `CvHeroRotator`, `CvTestimonials`, `CvStats`, `CvClientsMarquee`, `CvTechDiagram` et `CvStructuroCard`.
4. Tester chaque composant en local contre le prototype, côte à côte, en desktop et en 393 px.
5. Pousser les composants dans Webflow, puis assembler la page dans le Designer : sections natives pour le header, le footer et le CTA, composants de code pour le reste.
6. Publier sur le sous-domaine de préproduction `covalt-eu.webflow.io` pour la recette avant covalt.eu.
