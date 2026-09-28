import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { text } from "../../lib/declare";
import { TECH_DIAGRAM_DEFAULTS as D } from "../CvTechDiagram/CvTechDiagram";
import { CvTechSection } from "./CvTechSection";

export default declareComponent(CvTechSection, {
  name: "CvTechSection",
  description: "Section « La technologie Covalt » (fond encre) : titre, schéma animé et 3 piliers.",
  group: "Covalt",
  props: {
    eyebrow: text("Surtitre", "La technologie Covalt", "Section"),
    title: text("Titre", "Une plateforme propriétaire qui renforce chacune de nos offres.", "Section"),
    text: text(
      "Texte",
      "Développée en interne, la plateforme Covalt équipe nos équipes et vous donne un accès en lecture à vos opérations. Elle n'est pas un produit de plus : c'est ce qui rend nos services plus rapides, plus fiables et plus transparents.",
      "Section",
    ),
    module1: text("Module 1", D.module1, "Schéma"),
    module2: text("Module 2", D.module2, "Schéma"),
    module3: text("Module 3", D.module3, "Schéma"),
    platformName: text("Plateforme", D.platformName, "Schéma"),
    features: text("Fonctionnalités", D.features, "Schéma", "Séparées par des virgules."),
    pillar1Title: text("Pilier 1 : titre", "Détection en temps réel", "Piliers"),
    pillar1Text: text("Pilier 1 : texte", "Comptes bancaires, événements juridiques et financiers de l'emprunteur analysés en continu.", "Piliers"),
    pillar2Title: text("Pilier 2 : titre", "Transparence totale", "Piliers"),
    pillar2Text: text("Pilier 2 : texte", "Un accès en lecture à la plateforme de monitoring pour suivre vos opérations à tout moment.", "Piliers"),
    pillar3Title: text("Pilier 3 : titre", "Action immédiate", "Piliers"),
    pillar3Text: text("Pilier 3 : texte", "Alerte en cas d'incident, accompagnée d'une proposition d'action par nos experts.", "Piliers"),
  },
});
