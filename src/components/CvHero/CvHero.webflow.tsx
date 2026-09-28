import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { image, link, num, text } from "../../lib/declare";
import { HERO_ROTATOR_DEFAULTS as D } from "../CvHeroRotator/CvHeroRotator";
import { CvHero } from "./CvHero";

export default declareComponent(CvHero, {
  name: "CvHero",
  description: "Section hero complète : gravure, titre rotatif, paragraphe et deux CTA.",
  group: "Covalt",
  props: {
    prefix: text("Préfixe", D.prefix, "Titre"),
    lead: text("Liaison", D.lead, "Titre"),
    words: text("Mots", D.words, "Titre", "Mots séparés par des virgules."),
    suffix: text("Suffixe", D.suffix, "Titre"),
    intervalMs: num("Intervalle (ms)", D.intervalMs, { min: 300, max: 10000, group: "Titre" }),
    text: text("Paragraphe", "Covalt réunit technologie et expertise pour vous accompagner sur toute la chaîne de gestion de vos financements.", "Contenu"),
    primaryLabel: text("CTA principal", "Obtenir une proposition sur-mesure", "Contenu"),
    primaryLink: link("Lien CTA principal", "Contenu"),
    secondaryLabel: text("CTA secondaire", "Découvrir nos offres", "Contenu"),
    secondaryLink: link("Lien CTA secondaire", "Contenu"),
    engraving: image("Gravure (arrière-plan)", "Contenu", "Par défaut : frame-engraving-banner.png"),
  },
});
