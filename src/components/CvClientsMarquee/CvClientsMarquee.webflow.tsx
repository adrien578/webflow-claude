import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { image, num, series, text } from "../../lib/declare";
import { CvClientsMarquee, DEFAULT_LOGOS, MAX_LOGOS } from "./CvClientsMarquee";

export default declareComponent(CvClientsMarquee, {
  name: "CvClientsMarquee",
  description: "Bandeau de logos clients en défilement infini, pause au survol. Logos 1 à 9 pré-remplis ; hauteur 0 = logo masqué.",
  group: "Covalt",
  props: {
    label: text("Libellé", "Ils nous font confiance"),
    durationS: num("Durée d'un tour (s)", 40, { min: 5, max: 200 }),
    ...series(MAX_LOGOS, (i) => ({
      [`logo${i}`]: image(`Logo ${i}`, `Logo ${i}`, DEFAULT_LOGOS[i - 1] ? `Par défaut : ${DEFAULT_LOGOS[i - 1].alt}` : "Emplacement libre"),
      [`logo${i}Height`]: num(`Hauteur logo ${i} (px)`, DEFAULT_LOGOS[i - 1]?.height ?? 0, { min: 0, max: 120, group: `Logo ${i}` }),
    })),
  },
});
