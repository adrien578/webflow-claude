import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { text } from "../../lib/declare";
import { CvTechDiagram, TECH_DIAGRAM_DEFAULTS as D } from "./CvTechDiagram";

export default declareComponent(CvTechDiagram, {
  name: "CvTechDiagram",
  description: "Schéma de la plateforme avec impulsions animées (à poser sur fond encre #081412).",
  group: "Covalt",
  props: {
    module1: text("Module 1", D.module1),
    module2: text("Module 2", D.module2),
    module3: text("Module 3", D.module3),
    platformName: text("Plateforme", D.platformName),
    features: text("Fonctionnalités", D.features, undefined, "Séparées par des virgules."),
  },
});
