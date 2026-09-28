import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import * as styles from "./Stage.module.css";

type StageProps = {
  color: string;
  /** Afficher l'aplat de couleur (désactiver pour poser la carte seule). */
  backdrop?: boolean;
  className?: string;
  style?: CSSProperties;
  cardClassName?: string;
  cardProps?: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> };
  children: ReactNode;
  /** Éléments posés hors de la carte (ex. alerte Loan Protection). */
  after?: ReactNode;
};

export function Stage({ color, backdrop = true, className = "", style, cardClassName = "", cardProps, children, after }: StageProps) {
  return (
    <div className={`${styles.stage} ${backdrop ? "" : styles.bare} ${className}`} style={style}>
      {backdrop && <div className={styles.backdrop} style={{ background: color }} />}
      <div {...cardProps} className={`${styles.card} ${cardClassName}`}>
        {children}
      </div>
      {after}
    </div>
  );
}

export function CardHead({ title, subtitle, meta }: { title: ReactNode; subtitle: ReactNode; meta?: ReactNode }) {
  return (
    <div className={styles.cardHead}>
      <div className={styles.cardTitle}>
        <span>{title}</span>
        <span>{subtitle}</span>
      </div>
      {meta != null && <span className={styles.cardMeta}>{meta}</span>}
    </div>
  );
}
