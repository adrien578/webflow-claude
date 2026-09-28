import { useRef } from "react";
import engravingDefault from "../../assets/frame-engraving-banner.png";
import { useCovaltFonts, useReveal } from "../../lib/hooks";
import { linkAttrs, pickImage, type ImageValue, type LinkValue } from "../../lib/props";
import { HeroRotatorTitle, type CvHeroRotatorProps } from "../CvHeroRotator/CvHeroRotator";
import * as styles from "./CvHero.module.css";

export type CvHeroProps = CvHeroRotatorProps & {
  text?: string;
  primaryLabel?: string;
  primaryLink?: LinkValue;
  secondaryLabel?: string;
  secondaryLink?: LinkValue;
  engraving?: ImageValue;
};

/** Section hero complète : gravure, titre rotatif, paragraphe et deux CTA. */
export function CvHero({
  text = "Covalt réunit technologie et expertise pour vous accompagner sur toute la chaîne de gestion de vos financements.",
  primaryLabel = "Obtenir une proposition sur-mesure",
  primaryLink,
  secondaryLabel = "Découvrir nos offres",
  secondaryLink,
  engraving,
  ...rotator
}: CvHeroProps) {
  useCovaltFonts();
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const bg = pickImage(engraving, engravingDefault);
  return (
    <section ref={root} className={`cv-root ${styles.section}`}>
      <img className={styles.engraving} src={bg.src} alt="" aria-hidden="true" />
      <div className={`cv-container ${styles.inner}`}>
        <HeroRotatorTitle {...rotator} data-reveal="1" data-reveal-delay="80" />
        <p className={styles.text} data-reveal="1" data-reveal-delay="180">
          {text}
        </p>
        <div className={styles.ctas} data-reveal="1" data-reveal-delay="260">
          <a className="cv-btn cv-btn-green cv-btn-block" {...linkAttrs(primaryLink, "#contact")}>
            {primaryLabel} <span className={styles.arrow}>→</span>
          </a>
          <a className="cv-btn cv-btn-outline cv-btn-block" {...linkAttrs(secondaryLink, "#offres-detail")}>
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
