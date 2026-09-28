import { useRef } from "react";
import wordmark from "../../assets/covalt-wordmark.svg";
import { useCovaltFonts, useReveal } from "../../lib/hooks";
import { linkAttrs, type LinkValue } from "../../lib/props";
import { Bolt, StructuroFlow, type CvStructuroCardProps } from "../CvStructuroCard/CvStructuroCard";
import * as styles from "./CvStructuroSection.module.css";

export type CvStructuroSectionProps = CvStructuroCardProps & {
  brandName?: string;
  badgeFree?: string;
  badgeAi?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaLink?: LinkValue;
  disclaimer?: string;
};

/** Section Structuro : texte, badges et carte de démonstration animée. */
export function CvStructuroSection({
  brandName = "Structuro",
  badgeFree = "GRATUIT",
  badgeAi = "PROPULSÉ PAR L'IA",
  title = "Vous ne savez pas par où commencer ?",
  text = "Structuro analyse votre opération et vous recommande en quelques minutes la structure de sécurisation la plus adaptée — niveau de protection et coût inclus — avant même que le dossier ne soit lancé.",
  ctaLabel = "Essayer Structuro gratuitement →",
  ctaLink,
  disclaimer = "Les recommandations de Structuro sont fournies à titre indicatif et ne constituent pas un conseil financier ou juridique.",
  ...card
}: CvStructuroSectionProps) {
  useCovaltFonts();
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} className={`cv-root ${styles.section}`}>
      <div className={`cv-container ${styles.inner}`}>
        <div className={styles.copy}>
          <div className={styles.brand} data-reveal="1">
            <div className={styles.brandRow}>
              <Bolt size={30} color="#081412" />
              <span className={styles.brandName}>{brandName}</span>
            </div>
            <div className={styles.by}>
              by <img src={wordmark} alt="Covalt" />
            </div>
          </div>
          <div className={styles.badges} data-reveal="1">
            <span className={`${styles.badge} ${styles.free}`}>{badgeFree}</span>
            <span className={`${styles.badge} ${styles.ai}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              {badgeAi}
            </span>
          </div>
          <div className={styles.text} data-reveal="1">
            <h2 className="cv-h2">{title}</h2>
            <p className="cv-lead">{text}</p>
          </div>
          <div className={styles.cta} data-reveal="1">
            <div>
              <a className="cv-btn cv-btn-green cv-btn-block" {...linkAttrs(ctaLink, "#")}>
                {ctaLabel}
              </a>
            </div>
            <span className={styles.disclaimer}>{disclaimer}</span>
          </div>
        </div>
        <StructuroFlow {...card} />
      </div>
    </section>
  );
}
