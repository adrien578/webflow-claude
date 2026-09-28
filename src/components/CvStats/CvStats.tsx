import { useEffect, useRef, useState } from "react";
import { fmt } from "../../lib/format";
import { useCovaltFonts, useReducedMotion, useReveal } from "../../lib/hooks";
import * as styles from "./CvStats.module.css";

type Stat = { prefix: string; value: number; unit: string; description: string };

export const DEFAULT_STATS: Stat[] = [
  { prefix: "", value: 3, unit: "Md€", description: "de financements déjà sécurisés" },
  { prefix: "+", value: 450, unit: "", description: "contrats de fiducie et d'agency mis en place" },
  { prefix: "", value: 95, unit: "%", description: "de taux de recouvrement moyen" },
  { prefix: "", value: 40, unit: "", description: "réalisations de sûretés menées à terme" },
];
export const MAX_STATS = 4;

export type CvStatsProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  durationMs?: number;
  /** stat1Prefix, stat1Value, stat1Unit, stat1Description … stat4* */
  [key: `stat${number}${"Prefix" | "Unit" | "Description"}`]: string | undefined;
  [key: `stat${number}Value`]: number | undefined;
};

function resolveStats(p: Record<string, unknown>): Stat[] {
  const out: Stat[] = [];
  for (let i = 1; i <= MAX_STATS; i++) {
    const d = DEFAULT_STATS[i - 1];
    const s = (k: string, fb: string) => (typeof p[`stat${i}${k}`] === "string" ? (p[`stat${i}${k}`] as string) : fb);
    const v = p[`stat${i}Value`];
    const description = s("Description", d.description);
    if (!description && typeof v !== "number") continue;
    out.push({ prefix: s("Prefix", d.prefix), value: typeof v === "number" ? v : d.value, unit: s("Unit", d.unit), description });
  }
  return out;
}

/**
 * Chiffres clés : compteur de 0 à la valeur finale (easeOutCubic, 1600 ms)
 * déclenché quand la section entre dans l'écran (40 %).
 */
export function CvStats({
  eyebrow = "Expertise opérationnelle",
  title = "Une expertise éprouvée, des centaines d'opérations sécurisées.",
  text = "Juristes, gestionnaires et analystes crédit travaillent aux côtés des prêteurs, adossés à une technologie développée en interne.",
  durationMs = 1600,
  ...rest
}: CvStatsProps) {
  useCovaltFonts();
  const stats = resolveStats(rest);
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const reduced = useReducedMotion();
  // SSR / sans JS : valeurs finales. Le compteur repart de 0 au montage.
  const [t, setT] = useState(1);
  const started = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced || typeof IntersectionObserver === "undefined") {
      setT(1);
      return;
    }
    if (!started.current) setT(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / Math.max(1, durationMs));
          setT(1 - Math.pow(1 - k, 3));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, durationMs]);

  return (
    <section ref={root} className={`cv-root ${styles.section}`}>
      <div className={`cv-container ${styles.inner}`}>
        <div className="cv-intro">
          <div className={styles.heading} data-reveal="1">
            <div className="cv-eyebrow">{eyebrow}</div>
            <h2 className="cv-h2">{title}</h2>
          </div>
          <p className="cv-lead" data-reveal="1">
            {text}
          </p>
        </div>
        <div className={styles.grid}>
          {stats.map((s, i) => {
            const decimals = Number.isInteger(s.value) ? 0 : 1;
            const shown = fmt(decimals ? Math.round(s.value * t * 10) / 10 : Math.round(s.value * t), decimals);
            return (
              <div key={i} className={styles.stat} data-reveal="1">
                <div className={styles.value} aria-label={`${s.prefix}${fmt(s.value, decimals)} ${s.unit}`.trim()}>
                  <span aria-hidden="true">
                    {s.prefix}
                    {shown}
                  </span>
                  {s.unit && (
                    <span className={styles.unit} aria-hidden="true">
                      {s.unit}
                    </span>
                  )}
                </div>
                <div className={styles.desc}>{s.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
