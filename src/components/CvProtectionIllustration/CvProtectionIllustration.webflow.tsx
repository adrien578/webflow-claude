import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { bool, image, link, text } from "../../lib/declare";
import { CvProtectionIllustration } from "./CvProtectionIllustration";

export default declareComponent(CvProtectionIllustration, {
  name: "CvProtectionIllustration",
  description: "Loan Protection : compte séquestre, flux de transactions, alerte « bris de covenant » et intervention de l'expert.",
  group: "Covalt",
  props: {
    operationName: text("Opération", "Opération Invest", "Compte"),
    accountLabel: text("Compte", "Compte séquestre N°00090192183", "Compte"),
    statusLabel: text("Statut", "Surveillance active", "Compte"),
    balanceLabel: text("Libellé solde", "Solde en temps réel", "Compte"),
    thresholdLabel: text("Libellé seuil", "Seuil d'alerte", "Compte"),
    thresholdValue: text("Seuil", "150 000 €", "Compte"),
    expertName: text("Nom de l'expert", "Arthur Bertin", "Expert"),
    expertRole: text("Rôle de l'expert", "Chargé de sûretés", "Expert"),
    expertPhoto: image("Photo de l'expert", "Expert", "Photo carrée, affichée en cercle. Sans photo : initiales."),
    alertTitle: text("Titre de l'alerte", "Bris de covenant détecté", "Alerte"),
    alertTime: text("Heure de l'alerte", "14:02", "Alerte"),
    messageTime: text("Heure du message", "14:09", "Alerte"),
    alertText: text(
      "Message",
      "Un retrait de 60 000 € a été détecté, correspondant à un bris de covenant de la documentation de financement. L'opération inclut une fiducie sur bien immobilier. Que souhaitez-vous faire ?",
      "Alerte",
    ),
    actionPrimary: text("Action principale", "Demander l'activation de la sûreté", "Alerte"),
    actionPrimaryLink: link("Lien action principale", "Alerte"),
    actionSecondary: text("Action secondaire", "Échanger avec l'emprunteur", "Alerte"),
    actionSecondaryLink: link("Lien action secondaire", "Alerte"),
    color: text("Couleur de l'aplat", "#24826B", "Apparence"),
    backdrop: bool("Afficher l'aplat", true, "Apparence"),
  },
});
