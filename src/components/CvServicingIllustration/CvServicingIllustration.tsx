import { useRef, useState } from "react";
import { useCovaltFonts, useInView, useInterval, useReducedMotion } from "../../lib/hooks";
import { CardHead, Stage } from "../shared/Stage";
import * as styles from "./CvServicingIllustration.module.css";

export type Task = { title: string; sub: string };

export const DEFAULT_TASKS: Task[] = [
  { title: "Représentation de la masse (RMO)", sub: "Émission obligataire · Élan Finance" },
  { title: "Collecte du reporting T3", sub: "Pivot Performance · échéance 30/10" },
  { title: "Gestion extinctive (GEX)", sub: "Portefeuille Lab · 12 lignes" },
  { title: "Demande de waiver", sub: "Horizon Croissance · covenant levier" },
  { title: "Calcul des ratios financiers", sub: "Synergie Immo · T3 2026" },
];
export const MAX_TASKS = 6;

export type CvServicingIllustrationProps = {
  title?: string;
  subtitle?: string;
  doneSuffix?: string;
  statusTodo?: string;
  statusDoing?: string;
  statusDone?: string;
  color?: string;
  backdrop?: boolean;
  /** task1Title, task1Subtitle … task6* */
  [key: `task${number}${"Title" | "Subtitle"}`]: string | undefined;
};

export function resolveTasks(props: Record<string, unknown>): Task[] {
  const out: Task[] = [];
  for (let i = 1; i <= MAX_TASKS; i++) {
    const d = DEFAULT_TASKS[i - 1];
    const t = props[`task${i}Title`];
    const s = props[`task${i}Subtitle`];
    const title = typeof t === "string" ? t : (d?.title ?? "");
    if (!title) continue;
    out.push({ title, sub: typeof s === "string" ? s : (d?.sub ?? "") });
  }
  return out;
}

const TICK_MS = 3200;

/**
 * Statut d'une tâche au pas `tick` (reprend la séquence du prototype) :
 * À INSTRUIRE → EN COURS → TRAITÉ → TRAITÉ, décalée de 2 pas par tâche,
 * ce qui coche les tâches une à une.
 */
export function taskStage(tick: number, i: number): 0 | 1 | 2 {
  const q = Math.floor((tick + i * 2) / 2) % 4;
  return q === 3 ? 2 : (q as 0 | 1 | 2);
}

const STAGE_STYLE = [
  { color: "var(--color-warning)", ring: "var(--color-warning)", dot: "#FFF6E5" },
  { color: "var(--color-green-600)", ring: "var(--color-green-500)", dot: "var(--color-green-100)" },
  { color: "var(--text-secondary)", ring: "var(--color-green-500)", dot: "var(--color-green-500)" },
];

/** Tâches d'administration déléguée (Loan Servicing) cochées une à une. */
export function ServicingIllustration({
  title = "Administration déléguée",
  subtitle = "Octobre 2026 · 4 opérations",
  doneSuffix = "traités",
  statusTodo = "À INSTRUIRE",
  statusDoing = "EN COURS",
  statusDone = "TRAITÉ",
  color = "#8A8A6A",
  backdrop = true,
  ...rest
}: CvServicingIllustrationProps) {
  const tasks = resolveTasks(rest);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useInterval(() => setTick((t) => t + 1), TICK_MS, inView && !reduced);

  const labels = [statusTodo, statusDoing, statusDone];
  const n = Math.max(1, tasks.length);
  const rows = tasks.map((t, i) => {
    const st = taskStage(tick, i);
    return { ...t, st, active: st === 1 && i === tick % n };
  });
  const done = rows.filter((r) => r.st === 2).length;

  return (
    <div ref={rootRef}>
      <Stage color={color} backdrop={backdrop}>
        <CardHead title={title} subtitle={subtitle} meta={<span aria-live="polite">{`${done}/${rows.length} ${doneSuffix}`}</span>} />
        {rows.map((r, i) => {
          const s = STAGE_STYLE[r.st];
          return (
            <div key={i} className={`${styles.task} ${r.active ? styles.active : ""}`}>
              <span className={styles.dot} style={{ borderColor: s.ring, background: s.dot }} />
              <span className={styles.label}>
                <span>{r.title}</span>
                <span>{r.sub}</span>
              </span>
              <span className={styles.status} style={{ color: s.color }}>
                {labels[r.st]}
              </span>
            </div>
          );
        })}
      </Stage>
    </div>
  );
}

export function CvServicingIllustration(props: CvServicingIllustrationProps) {
  useCovaltFonts();
  return (
    <div className="cv-root">
      <ServicingIllustration {...props} />
    </div>
  );
}
