import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { bool, series, text } from "../../lib/declare";
import { CvServicingIllustration, DEFAULT_TASKS, MAX_TASKS } from "./CvServicingIllustration";

export default declareComponent(CvServicingIllustration, {
  name: "CvServicingIllustration",
  description: "Loan Servicing : tâches d'administration cochées une à une, compteur « x/n traités ».",
  group: "Covalt",
  props: {
    title: text("Titre", "Administration déléguée", "Carte"),
    subtitle: text("Sous-titre", "Octobre 2026 · 4 opérations", "Carte"),
    doneSuffix: text("Suffixe du compteur", "traités", "Carte"),
    statusTodo: text("Statut « à faire »", "À INSTRUIRE", "Statuts"),
    statusDoing: text("Statut « en cours »", "EN COURS", "Statuts"),
    statusDone: text("Statut « fait »", "TRAITÉ", "Statuts"),
    color: text("Couleur de l'aplat", "#8A8A6A", "Apparence"),
    backdrop: bool("Afficher l'aplat", true, "Apparence"),
    ...series(MAX_TASKS, (i) => {
      const d = DEFAULT_TASKS[i - 1];
      return {
        [`task${i}Title`]: text("Tâche", d?.title ?? "", `Tâche ${i}`, "Vide = tâche masquée."),
        [`task${i}Subtitle`]: text("Détail", d?.sub ?? "", `Tâche ${i}`),
      };
    }),
  },
});
