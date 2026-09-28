import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { image, link, series, text } from "../../lib/declare";
import { CvFooter, FOOTER_COLUMNS } from "./CvFooter";

export default declareComponent(CvFooter, {
  name: "CvFooter",
  description: "Pied de page (fond encre) : marque, 3 colonnes de liens, mentions.",
  group: "Covalt",
  props: {
    logo: image("Logo (clair)", "Marque", "Par défaut : wordmark Covalt inversé"),
    tagline: text("Accroche", "Le partenaire des prêteurs pour sourcer, sécuriser et administrer leurs financements.", "Marque"),
    ...series(3, (c) => {
      const col = FOOTER_COLUMNS[c - 1];
      const g = `Colonne ${c}`;
      return {
        [`col${c}Title`]: text("Titre", col.title, g),
        ...series(4, (l) => ({
          [`col${c}Link${l}Label`]: text(`Lien ${l}`, col.links[l - 1]?.label ?? "", g, "Vide = lien masqué."),
          [`col${c}Link${l}`]: link(`Lien ${l} : destination`, g),
        })),
      };
    }),
    copyright: text("Copyright", "© 2026 Covalt", "Bas de page"),
    legal: text("Mentions", "Mentions légales · Confidentialité", "Bas de page"),
    legalLink: link("Lien mentions", "Bas de page"),
  },
});
