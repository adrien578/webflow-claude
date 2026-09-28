import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { bool, num, series, text } from "../../lib/declare";
import { CvConnectIllustration, DEFAULT_DEALS, MAX_DEALS } from "./CvConnectIllustration";

export default declareComponent(CvConnectIllustration, {
  name: "CvConnectIllustration",
  description: "Loan Connect : tableau d'opérations interactif et popup de mise en relation (ouverture automatique sans interaction).",
  group: "Covalt",
  props: {
    title: text("Titre", "Dossiers pré-qualifiés", "Carte"),
    subtitle: text("Sous-titre", "Sélection pour votre profil de risque", "Carte"),
    countLabel: text("Compteur", "210 opérations", "Carte"),
    requestLabel: text("Bouton de demande", "Demander une mise en relation", "Popup"),
    confirmationText: text("Confirmation", "Demande transmise à l'équipe Covalt.", "Popup"),
    autoOpenDelayMs: num("Délai d'ouverture auto (ms)", 3000, { min: 500, max: 20000, group: "Comportement" }),
    color: text("Couleur de l'aplat", "#007AA3", "Apparence"),
    backdrop: bool("Afficher l'aplat", true, "Apparence"),
    ...series(MAX_DEALS, (i) => {
      const d = DEFAULT_DEALS[i - 1];
      const g = `Opération ${i}`;
      return {
        [`deal${i}Name`]: text("Nom", d.name, g, "Vide = ligne masquée."),
        [`deal${i}Object`]: text("Objet", d.obj, g),
        [`deal${i}Amount`]: text("Montant", d.amount, g),
        [`deal${i}Security`]: text("Sûreté", d.sec, g),
        [`deal${i}Duration`]: text("Durée", d.dur, g),
      };
    }),
  },
});
