import * as styles from "./ProgressFill.module.css";

type Props = {
  /** Durée du remplissage (ms). */
  ms: number;
  running: boolean;
  color?: string;
  /** Ligne pleine, sans animation (onglet verrouillé, animations réduites). */
  full?: boolean;
};

/** Barre de progression de 2 px (scaleX 0 → 1, linéaire). Relancer via `key`. */
export function ProgressFill({ ms, running, color = "var(--color-green-500)", full = false }: Props) {
  if (full) return <span className={styles.full} style={{ background: color }} />;
  return (
    <span
      className={styles.fill}
      style={{ background: color, animationDuration: `${ms}ms`, animationPlayState: running ? "running" : "paused" }}
    />
  );
}
