import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { image, num, series, text } from "../../lib/declare";
import { CvTestimonials, DEFAULT_TESTIMONIALS, MAX_TESTIMONIALS } from "./CvTestimonials";

export default declareComponent(CvTestimonials, {
  name: "CvTestimonials",
  description: "Carrousel de témoignages : auto toutes les 8 s, pause au survol, flèches, compteur et barres cliquables. Citation vide = témoignage masqué.",
  group: "Covalt",
  props: {
    eyebrow: text("Surtitre", "Cas clients", "Section"),
    title: text("Titre", "Ils nous confient leurs financements.", "Section"),
    intervalMs: num("Intervalle (ms)", 8000, { min: 2000, max: 30000, group: "Section" }),
    ...series(MAX_TESTIMONIALS, (i) => {
      const d = DEFAULT_TESTIMONIALS[i - 1];
      const g = `Témoignage ${i}`;
      return {
        [`item${i}Quote`]: text("Citation", d?.quote ?? "", g, "Vide = témoignage masqué."),
        [`item${i}Name`]: text("Nom", d?.name ?? "", g),
        [`item${i}Company`]: text("Société", d?.company ?? "", g),
        [`item${i}Offer`]: text("Badge d'offre", d?.offer ?? "", g),
        [`item${i}Logo`]: image("Logo", g, d ? `Par défaut : logo ${d.company}` : undefined),
        [`item${i}LogoHeight`]: num("Hauteur du logo (px)", d?.logoHeight ?? 40, { min: 8, max: 120, group: g }),
      };
    }),
  },
});
