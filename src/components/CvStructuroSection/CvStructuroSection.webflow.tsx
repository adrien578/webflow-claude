import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { link, num, text } from "../../lib/declare";
import { CvStructuroSection } from "./CvStructuroSection";

const S = "Section";
const G = "Carte : opération";
const R = "Carte : recommandations";

export default declareComponent(CvStructuroSection, {
  name: "CvStructuroSection",
  description: "Section Structuro : texte, badges « GRATUIT · PROPULSÉ PAR L'IA » et carte de démonstration animée.",
  group: "Covalt",
  props: {
    brandName: text("Nom", "Structuro", S),
    badgeFree: text("Badge 1", "GRATUIT", S),
    badgeAi: text("Badge 2", "PROPULSÉ PAR L'IA", S),
    title: text("Titre", "Vous ne savez pas par où commencer ?", S),
    text: text(
      "Texte",
      "Structuro analyse votre opération et vous recommande en quelques minutes la structure de sécurisation la plus adaptée — niveau de protection et coût inclus — avant même que le dossier ne soit lancé.",
      S,
    ),
    ctaLabel: text("CTA", "Essayer Structuro gratuitement →", S),
    ctaLink: link("Lien CTA", S),
    disclaimer: text("Mention", "Les recommandations de Structuro sont fournies à titre indicatif et ne constituent pas un conseil financier ou juridique.", S),
    operationLabel: text("Libellé opération", "Votre opération", G),
    field1Label: text("Champ 1", "Montant", G),
    field1Value: text("Valeur 1", "1 M€", G),
    field2Label: text("Champ 2", "Durée", G),
    field2Value: text("Valeur 2", "36 mois", G),
    field3Label: text("Champ 3", "Actif", G),
    field3Value: text("Valeur 3", "Bureaux", G),
    field4Label: text("Champ 4", "Type", G),
    field4Value: text("Valeur 4", "Immobilier", G),
    aiLabel: text("Libellé IA", "ANALYSE IA", G),
    transferLabel: text("Libellé transfert", "Transfert", R),
    protectionLabel: text("Libellé protection", "Protection", R),
    costLabel: text("Libellé coût", "Coût", R),
    result1Name: text("Structure 1", "Fiducie", R),
    result1Transfer: text("Structure 1 : transfert", "Acté", R),
    result1Protection: num("Structure 1 : protection (0-5)", 5, { min: 0, max: 5, group: R }),
    result1Cost: text("Structure 1 : coût", "à définir", R),
    result2Name: text("Structure 2", "Agency", R),
    result2Transfer: text("Structure 2 : transfert", "Possible", R),
    result2Protection: num("Structure 2 : protection (0-5)", 4, { min: 0, max: 5, group: R }),
    result2Cost: text("Structure 2 : coût", "à définir", R),
  },
});
