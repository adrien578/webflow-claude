import { declareComponent } from "@webflow/react";
import "../../styles/tokens.css";
import { image, link, text } from "../../lib/declare";
import { CvHeader } from "./CvHeader";

export default declareComponent(CvHeader, {
  name: "CvHeader",
  description: "Header sticky : navigation desktop, menu burger plein écran sous 992 px. Les liens d'offres sélectionnent l'onglet de CvOffers.",
  group: "Covalt",
  props: {
    logo: image("Logo", "Marque", "Par défaut : wordmark Covalt"),
    homeLink: link("Lien du logo", "Marque"),
    offer1Label: text("Offre 1", "Loan Connect", "Navigation"),
    offer2Label: text("Offre 2", "Loan Protection", "Navigation"),
    offer3Label: text("Offre 3", "Loan Servicing", "Navigation"),
    offersLink: link("Lien des offres", "Navigation", "Ancre de la section offres (#offres-detail)."),
    techLabel: text("Technologie", "Technologie", "Navigation"),
    techLink: link("Lien Technologie", "Navigation"),
    structuroLabel: text("Structuro", "Structuro", "Navigation"),
    structuroLink: link("Lien Structuro", "Navigation"),
    expertiseLabel: text("Expertise (mobile)", "Expertise", "Navigation"),
    expertiseLink: link("Lien Expertise", "Navigation"),
    casesLabel: text("Cas clients (mobile)", "Cas clients", "Navigation"),
    casesLink: link("Lien Cas clients", "Navigation"),
    loginLabel: text("Connexion", "Connexion", "Actions"),
    loginLink: link("Lien Connexion", "Actions"),
    ctaLabel: text("CTA", "Obtenir une proposition", "Actions"),
    ctaShortLabel: text("CTA (mobile)", "Proposition", "Actions"),
    ctaLink: link("Lien CTA", "Actions"),
  },
});
