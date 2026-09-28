import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import "../../styles/tokens.css";
import { image, link, num, series, text } from "../../lib/declare";
import { CvOffers, OFFER_DEFAULTS, TAB_OPTIONS } from "./CvOffers";

export default declareComponent(CvOffers, {
  name: "CvOffers",
  description:
    "Onglets et panneaux des 3 offres : défilement auto avec ligne de progression, verrouillage au clic, pause au survol. Les illustrations intégrées peuvent être remplacées via les slots.",
  group: "Covalt",
  props: {
    sectionTitle: text("Titre de section", "Trois offres, un seul partenaire sur toute la vie du financement.", "Section"),
    sectionText: text("Sous-titre de section", "Covalt vous accompagne sur toute le cycle de vie de vos financements.", "Section"),
    tabMs: num("Durée par onglet (ms)", 9000, { min: 2000, max: 30000, group: "Section" }),
    initialTab: props.Variant({ name: "Onglet initial", options: TAB_OPTIONS, defaultValue: "Loan Protection", group: "Section" }),
    ...series(3, (i) => {
      const d = OFFER_DEFAULTS[i - 1];
      const g = `Offre ${i} — ${d.logoAlt}`;
      return {
        [`offer${i}Eyebrow`]: text("Onglet : surtitre", d.eyebrow, g),
        [`offer${i}Logo`]: image("Onglet : logo", g, `Par défaut : logo ${d.logoAlt}`),
        [`offer${i}LogoHeight`]: num("Onglet : hauteur du logo (px)", d.logoHeight, { min: 8, max: 120, group: g }),
        [`offer${i}LogoOffset`]: num("Onglet : décalage vertical du logo (px)", d.logoOffset, { min: -60, max: 60, group: g }),
        [`offer${i}Subtitle`]: text("Onglet : sous-titre", d.subtitle, g),
        [`offer${i}Color`]: text("Couleur de l'offre", d.color, g),
        [`offer${i}TextColor`]: text("Couleur du texte (surtitre)", d.textColor, g),
        [`offer${i}PanelEyebrow`]: text("Panneau : surtitre", d.panelEyebrow, g),
        [`offer${i}Title`]: text("Panneau : titre", d.title, g),
        [`offer${i}Body`]: text("Panneau : texte", d.body, g),
        ...series(4, (j) => ({ [`offer${i}Bullet${j}`]: text(`Puce ${j}`, d.bullets[j - 1], g) })),
        [`offer${i}CtaLabel`]: text("CTA : libellé", d.ctaLabel, g),
        [`offer${i}CtaLink`]: link("CTA : lien", g),
        [`illustration${i}`]: props.Slot({ name: `Illustration ${i} (optionnel)`, group: g, tooltip: "Vide = illustration animée intégrée." }),
      };
    }),
  },
});
