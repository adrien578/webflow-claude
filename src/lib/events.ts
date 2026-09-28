/**
 * Communication entre composants (chacun vit dans son propre Shadow DOM).
 *
 * - OFFER_SELECT : le header (ou tout lien) demande à CvOffers d'afficher et
 *   de verrouiller une offre. `detail` = index 0..2.
 * - OFFERS_HOLD : une illustration signale qu'une popup ouverte par
 *   l'utilisateur est affichée ; CvOffers met alors son défilement en pause.
 *   L'événement traverse les Shadow DOM (composed) et remonte (bubbles).
 */
export const OFFER_SELECT = "covalt:select-offer";
export const OFFERS_HOLD = "covalt:offers-hold";

export function selectOffer(index: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<number>(OFFER_SELECT, { detail: index }));
}

export function emitOffersHold(from: EventTarget | null, hold: boolean): void {
  if (!from) return;
  from.dispatchEvent(new CustomEvent<boolean>(OFFERS_HOLD, { detail: hold, bubbles: true, composed: true }));
}
