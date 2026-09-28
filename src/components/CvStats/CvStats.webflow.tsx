import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { num, series, text } from "../../lib/declare";
import { CvStats, DEFAULT_STATS, MAX_STATS } from "./CvStats";

export default declareComponent(CvStats, {
  name: "CvStats",
  description: "Chiffres clés avec compteur (0 → valeur, 1600 ms, easeOutCubic) à l'entrée dans l'écran.",
  group: "Covalt",
  props: {
    eyebrow: text("Surtitre", "Expertise opérationnelle", "Section"),
    title: text("Titre", "Une expertise éprouvée, des centaines d'opérations sécurisées.", "Section"),
    text: text("Texte", "Juristes, gestionnaires et analystes crédit travaillent aux côtés des prêteurs, adossés à une technologie développée en interne.", "Section"),
    durationMs: num("Durée du compteur (ms)", 1600, { min: 200, max: 10000, group: "Section" }),
    ...series(MAX_STATS, (i) => {
      const d = DEFAULT_STATS[i - 1];
      const g = `Chiffre ${i}`;
      return {
        [`stat${i}Prefix`]: text("Préfixe", d.prefix, g),
        [`stat${i}Value`]: num("Valeur", d.value, { decimals: 1, group: g }),
        [`stat${i}Unit`]: text("Unité", d.unit, g),
        [`stat${i}Description`]: text("Description", d.description, g),
      };
    }),
  },
});
