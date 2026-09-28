import { useRef, type HTMLAttributes } from "react";
import { splitList } from "../../lib/format";
import { useCovaltFonts, useInView } from "../../lib/hooks";
import * as styles from "./CvTechDiagram.module.css";

export type CvTechDiagramProps = {
  module1?: string;
  module2?: string;
  module3?: string;
  platformName?: string;
  /** Fonctionnalités de la plateforme, séparées par des virgules. */
  features?: string;
};

export const TECH_DIAGRAM_DEFAULTS = {
  module1: "Loan Connect",
  module2: "Loan Protection",
  module3: "Loan Servicing",
  platformName: "Plateforme Covalt",
  features: "Connexion bancaire, Signaux faibles, Alertes métier, Espace collaboratif, Piste d'audit",
};

/** Schéma : 3 offres reliées à la plateforme par des impulsions animées. */
export function TechDiagram({
  module1 = TECH_DIAGRAM_DEFAULTS.module1,
  module2 = TECH_DIAGRAM_DEFAULTS.module2,
  module3 = TECH_DIAGRAM_DEFAULTS.module3,
  platformName = TECH_DIAGRAM_DEFAULTS.platformName,
  features = TECH_DIAGRAM_DEFAULTS.features,
  className = "",
  ...rest
}: CvTechDiagramProps & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const modules = [module1, module2, module3];
  return (
    <div ref={ref} className={`${styles.diagram} ${inView ? "" : styles.static} ${className}`} {...rest}>
      <div className={styles.offers}>
        {modules.map((m, i) => (
          <div key={i} className={styles.offer}>
            <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.offerName}>{m}</span>
          </div>
        ))}
      </div>
      <div className={styles.links} aria-hidden="true">
        {[0, 0.8, 1.6].map((delay) => (
          <div key={delay} className={styles.line}>
            <span className={styles.pulseV} style={{ animationDelay: `${delay}s` }} />
          </div>
        ))}
      </div>
      <div className={styles.platform}>
        <div className={styles.topLine} aria-hidden="true">
          <span className={styles.pulseH} />
        </div>
        <span className={styles.platformName}>{platformName}</span>
        <ul className={styles.chips}>
          {splitList(features).map((f) => (
            <li key={f} className={styles.chip}>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Composant autonome (fond encre conseillé autour). */
export function CvTechDiagram(props: CvTechDiagramProps) {
  useCovaltFonts();
  return (
    <div className="cv-root">
      <TechDiagram {...props} />
    </div>
  );
}
