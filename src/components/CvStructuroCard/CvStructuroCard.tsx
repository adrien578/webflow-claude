import { useRef, type HTMLAttributes } from "react";
import { useCovaltFonts, useReveal } from "../../lib/hooks";
import * as styles from "./CvStructuroCard.module.css";

export type CvStructuroCardProps = {
  operationLabel?: string;
  field1Label?: string;
  field1Value?: string;
  field2Label?: string;
  field2Value?: string;
  field3Label?: string;
  field3Value?: string;
  field4Label?: string;
  field4Value?: string;
  aiLabel?: string;
  transferLabel?: string;
  protectionLabel?: string;
  costLabel?: string;
  result1Name?: string;
  result1Transfer?: string;
  result1Protection?: number;
  result1Cost?: string;
  result2Name?: string;
  result2Transfer?: string;
  result2Protection?: number;
  result2Cost?: string;
};

export const Bolt = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flex: "none" }}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

/** Carte de démonstration Structuro : opération → analyse IA → 2 structures. */
export function StructuroFlow({
  operationLabel = "Votre opération",
  field1Label = "Montant",
  field1Value = "1 M€",
  field2Label = "Durée",
  field2Value = "36 mois",
  field3Label = "Actif",
  field3Value = "Bureaux",
  field4Label = "Type",
  field4Value = "Immobilier",
  aiLabel = "ANALYSE IA",
  transferLabel = "Transfert",
  protectionLabel = "Protection",
  costLabel = "Coût",
  result1Name = "Fiducie",
  result1Transfer = "Acté",
  result1Protection = 5,
  result1Cost = "à définir",
  result2Name = "Agency",
  result2Transfer = "Possible",
  result2Protection = 4,
  result2Cost = "à définir",
  className = "",
  ...rest
}: CvStructuroCardProps & HTMLAttributes<HTMLDivElement>) {
  const fields = [
    [field1Label, field1Value],
    [field2Label, field2Value],
    [field3Label, field3Value],
    [field4Label, field4Value],
  ].filter(([l]) => l);
  const results = [
    { name: result1Name, transfer: result1Transfer, level: result1Protection, cost: result1Cost, delay: "550" },
    { name: result2Name, transfer: result2Transfer, level: result2Protection, cost: result2Cost, delay: "650" },
  ];
  return (
    <div className={`${styles.flow} ${className}`} {...rest}>
      <div className={styles.card} data-reveal="1">
        <span className={styles.cardLabel}>{operationLabel}</span>
        {fields.map(([l, v]) => (
          <div key={l} className={styles.line}>
            <span>{l}</span>
            <span className={styles.strong}>{v}</span>
          </div>
        ))}
      </div>

      <svg className={`${styles.dash} ${styles.dashH}`} data-reveal="1" data-reveal-delay="200" width="100%" height="2" viewBox="0 0 40 2" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="1" x2="40" y2="1" />
      </svg>
      <svg className={`${styles.dash} ${styles.dashV}`} data-reveal="1" data-reveal-delay="200" width="2" height="36" viewBox="0 0 2 36" preserveAspectRatio="none" aria-hidden="true">
        <line x1="1" y1="0" x2="1" y2="36" />
      </svg>

      <div className={styles.node} data-reveal="1" data-reveal-delay="300">
        <div className={styles.nodeCircle}>
          <span className={styles.ring} />
          <span className={styles.disc}>
            <Bolt size={26} color="#24826B" />
          </span>
        </div>
        <span className={styles.nodeLabel}>{aiLabel}</span>
      </div>

      <svg className={`${styles.dash} ${styles.branchH}`} data-reveal="1" data-reveal-delay="450" width="100%" height="220" viewBox="0 0 48 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 110 C 24 110, 24 50, 48 50" />
        <path d="M0 110 C 24 110, 24 170, 48 170" />
      </svg>
      <svg className={`${styles.dash} ${styles.branchV}`} data-reveal="1" data-reveal-delay="450" width="100%" height="44" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true">
        <path d="M100 0 C 100 22, 50 22, 50 44" />
        <path d="M100 0 C 100 22, 150 22, 150 44" />
      </svg>

      <div className={styles.results}>
        {results.map((r) => (
          <div key={r.name} className={`${styles.card} ${styles.result}`} data-reveal="1" data-reveal-delay={r.delay}>
            <span className={styles.resultName}>{r.name}</span>
            <div className={styles.line}>
              <span>{transferLabel}</span>
              <span className={styles.strong}>{r.transfer}</span>
            </div>
            <div className={styles.line}>
              <span>{protectionLabel}</span>
              <span className={styles.meter} aria-label={`${r.level}/5`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={i < r.level ? styles.on : ""} />
                ))}
              </span>
            </div>
            <div className={styles.line}>
              <span>{costLabel}</span>
              <span className={styles.tbd}>{r.cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CvStructuroCard(props: CvStructuroCardProps) {
  useCovaltFonts();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return (
    <div ref={root} className="cv-root">
      <StructuroFlow {...props} />
    </div>
  );
}
