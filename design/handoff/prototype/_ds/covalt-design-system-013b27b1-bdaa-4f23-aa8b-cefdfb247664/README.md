# Covalt — Design System

Le système de design pour Covalt, la solution SaaS qui aide les prêteurs à organiser leurs financements, leurs covenants et leurs garanties dans un seul outil. Ce dépôt rassemble les fondamentaux de marque, les composants d'interface, les templates de slides et les signatures email.

## Sommaire

- **[index.html](./index.html)** — Le hub. Commencez ici.
- **Foundations**
  - [Couleurs](./foundations/colors.html)
  - [Typographie](./foundations/typography.html)
  - [Espacement & rayons](./foundations/space-and-radii.html)
  - [Iconographie](./foundations/iconography.html)
  - [Élévation & motion](./foundations/elevation-motion.html)
- **Brand**
  - [Logo & symbole](./brand/logo.html)
  - [Voix & ton](./brand/voice.html)
  - [Imagerie](./brand/imagery.html)
- **UI Kit — Site marketing**
  - [Boutons, badges, formulaires](./ui-kit/components.html)
  - [Header, footer, blog cards, sections](./ui-kit/marketing-blocks.html)
  - [Écrans](./ui-kit/screens.html)
- **Templates de slides** — [slides.html](./slides.html)
- **Signatures email** — [signatures.html](./signatures.html)

## Pour qui

Designers, développeurs front-end, équipe marketing, et tout intervenant externe qui produit pour Covalt.

## Tokens

Tous les tokens sont déclarés en CSS custom properties dans `tokens.css`. Importez ce fichier au début de toute nouvelle page :

```html
<link rel="stylesheet" href="/tokens.css">
```

Les tokens couvrent : famille de polices, palette complète (vert primaire, neutres, secondaires, sémantiques, alias texte / surface), échelle typo, espacement (grille 4 pt), rayons, élévations, motion, et conteneurs. Un mode sombre est exposé via `data-theme="dark"`.

## Polices

- **Gerstner Programm FSL** — la face d'affichage. Sous licence FontStand. Le fallback compose vers Gerstner Originals puis vers une stack serif système afin que le layout ne s'effondre jamais.
- **Inter** — chargée depuis Google Fonts. UI, corps, labels.
- **Catalogue** — réservée aux moments éditoriaux (couvertures, citations). Non chargée par défaut.

## Couleurs principales

| Token | Hex | Usage |
|---|---|---|
| `--color-green-500` | `#24826B` | Primaire. CTAs, données clés. |
| `--color-light-green` | `#E0FEB3` | Surface douce, fond du favicon. |
| `--color-ink` | `#081412` | Wordmark, corps de texte. |
| `--color-bone` | `#F5F7F5` | Surface de page. |
| `--color-polar-blue` | `#DCE2DF` | Hairlines, séparateurs. |

## Iconographie

100 % [Lucide](https://lucide.dev) — strokes 1.5 px, sans remplissage, taille de base 20 px. Ne pas changer l'épaisseur, ne pas créer de pattern, ne pas changer l'axe de rotation (cf. brandbook page 7).

## Voix & ton

B2B sérieux et expert. Direct, factuel, jamais condescendant. On parle aux directions financières, aux gestionnaires de financement, aux back-offices crédit. Le vocabulaire bancaire est respecté ; les anglicismes sont évités quand un équivalent français existe.

## Conventions de fichiers

- HTML pages utilisent `tokens.css` en premier.
- Pas de logique métier dans les composants de présentation : chaque template est statique, illustratif.
- Tous les textes sont en français sauf mention explicite.
