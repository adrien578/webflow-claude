import { useRef } from "react";
import { useCovaltFonts, useReveal } from "../../lib/hooks";
import { TechDiagram, type CvTechDiagramProps } from "../CvTechDiagram/CvTechDiagram";
import * as styles from "./CvTechSection.module.css";

export type CvTechSectionProps = CvTechDiagramProps & {
  eyebrow?: string;
  title?: string;
  text?: string;
  pillar1Title?: string;
  pillar1Text?: string;
  pillar2Title?: string;
  pillar2Text?: string;
  pillar3Title?: string;
  pillar3Text?: string;
};

/** Section « La technologie Covalt » (fond encre) avec le schéma animé. */
export function CvTechSection({
  eyebrow = "La technologie Covalt",
  title = "Une plateforme propriétaire qui renforce chacune de nos offres.",
  text = "Développée en interne, la plateforme Covalt équipe nos équipes et vous donne un accès en lecture à vos opérations. Elle n'est pas un produit de plus : c'est ce qui rend nos services plus rapides, plus fiables et plus transparents.",
  pillar1Title = "Détection en temps réel",
  pillar1Text = "Comptes bancaires, événements juridiques et financiers de l'emprunteur analysés en continu.",
  pillar2Title = "Transparence totale",
  pillar2Text = "Un accès en lecture à la plateforme de monitoring pour suivre vos opérations à tout moment.",
  pillar3Title = "Action immédiate",
  pillar3Text = "Alerte en cas d'incident, accompagnée d'une proposition d'action par nos experts.",
  ...diagram
}: CvTechSectionProps) {
  useCovaltFonts();
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const pillars = [
    [pillar1Title, pillar1Text],
    [pillar2Title, pillar2Text],
    [pillar3Title, pillar3Text],
  ].filter(([t, d]) => t || d);
  return (
    <section ref={root} className={`cv-root ${styles.section}`}>
      <div className={`cv-container ${styles.inner}`}>
        <div className="cv-intro">
          <div className={styles.heading}>
            <div className={`cv-eyebrow ${styles.eyebrow}`} data-reveal="1">
              {eyebrow}
            </div>
            <h2 className={`cv-h2 ${styles.title}`} data-reveal="1">
              {title}
            </h2>
          </div>
          <p className={`cv-lead ${styles.lead}`} data-reveal="1">
            {text}
          </p>
        </div>
        <TechDiagram {...diagram} data-reveal="1" />
        <div className={styles.pillars}>
          {pillars.map(([t, d], i) => (
            <div key={i} className={styles.pillar} data-reveal="1" data-reveal-delay={String(i * 80)}>
              <span className={styles.pillarTitle}>{t}</span>
              <span className={styles.pillarText}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
