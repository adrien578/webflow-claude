import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { num, text } from "../../lib/declare";
import { CvHeroRotator, HERO_ROTATOR_DEFAULTS as D } from "./CvHeroRotator";

export default declareComponent(CvHeroRotator, {
  name: "CvHeroRotator",
  description: "Titre h1 du hero avec le mot qui glisse (sourcer, sécuriser, administrer).",
  group: "Covalt",
  props: {
    prefix: text("Préfixe", D.prefix),
    lead: text("Liaison", D.lead, undefined, "Mot placé avant le mot rotatif (« pour »)."),
    words: text("Mots", D.words, undefined, "Mots séparés par des virgules."),
    suffix: text("Suffixe", D.suffix),
    intervalMs: num("Intervalle (ms)", D.intervalMs, { min: 300, max: 10000 }),
  },
});
