import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { link, text } from "../../lib/declare";
import { CvCta } from "./CvCta";

export default declareComponent(CvCta, {
  name: "CvCta",
  description: "Bandeau d'appel à l'action vert « Parlons de votre prochaine opération. »",
  group: "Covalt",
  props: {
    title: text("Titre", "Parlons de votre prochaine opération."),
    text: text("Texte", "Un expert Covalt étudie votre dossier et vous adresse une proposition sur-mesure sous 48 heures."),
    primaryLabel: text("CTA principal", "Obtenir une proposition"),
    primaryLink: link("Lien CTA principal"),
    secondaryLabel: text("CTA secondaire", "Échanger avec un expert"),
    secondaryLink: link("Lien CTA secondaire"),
  },
});
