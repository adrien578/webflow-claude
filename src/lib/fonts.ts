import gerstnerRegular from "../assets/fonts/GerstnerProgrammFSL-Regular.otf";
import gerstnerBold from "../assets/fonts/Gerstner_Original_Bold.ttf";

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

/**
 * Les @font-face déclarés dans un Shadow DOM ne sont pas pris en compte par
 * les navigateurs : on les injecte donc une seule fois dans le <head> du
 * document. Si les polices sont déjà installées sur le site Webflow (même
 * nom de famille), l'injection est simplement redondante.
 */
export function ensureFonts(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("cv-fonts")) return;

  const style = document.createElement("style");
  style.id = "cv-fonts";
  style.textContent = `
@font-face{font-family:"Gerstner Programm FSL";src:url("${gerstnerRegular}") format("opentype");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Gerstner Programm FSL";src:url("${gerstnerBold}") format("truetype");font-weight:700;font-style:normal;font-display:swap}`;
  document.head.appendChild(style);

  if (!document.querySelector(`link[href="${GOOGLE_FONTS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS;
    document.head.appendChild(link);
  }
}
