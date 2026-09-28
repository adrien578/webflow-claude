import { useRef } from "react";
import { useCovaltFonts, useReveal } from "../../lib/hooks";
import { linkAttrs, type LinkValue } from "../../lib/props";
import * as styles from "./CvCta.module.css";

export type CvCtaProps = {
  title?: string;
  text?: string;
  primaryLabel?: string;
  primaryLink?: LinkValue;
  secondaryLabel?: string;
  secondaryLink?: LinkValue;
};

/** Bandeau d'appel à l'action vert. */
export function CvCta({
  title = "Parlons de votre prochaine opération.",
  text = "Un expert Covalt étudie votre dossier et vous adresse une proposition sur-mesure sous 48 heures.",
  primaryLabel = "Obtenir une proposition",
  primaryLink,
  secondaryLabel = "Échanger avec un expert",
  secondaryLink,
}: CvCtaProps) {
  useCovaltFonts();
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} className={`cv-root ${styles.section}`}>
      <div className={`cv-container ${styles.inner}`}>
        <div className={styles.copy}>
          <h2 className={`cv-h2 ${styles.title}`} data-reveal="1">
            {title}
          </h2>
          <p className={styles.text} data-reveal="1">
            {text}
          </p>
        </div>
        <div className={styles.actions} data-reveal="1">
          <a className={`cv-btn ${styles.primary}`} {...linkAttrs(primaryLink, "#")}>
            {primaryLabel}
          </a>
          <a className={`cv-btn ${styles.secondary}`} {...linkAttrs(secondaryLink, "#")}>
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
