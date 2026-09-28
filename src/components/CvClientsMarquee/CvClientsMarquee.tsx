import { useRef } from "react";
import arkea from "../../assets/clients/arkea.png";
import bpce from "../../assets/clients/bpce-lease.png";
import eurazeo from "../../assets/clients/eurazeo.png";
import interinvest from "../../assets/clients/interinvest.png";
import mcapital from "../../assets/clients/mcapital.png";
import o2capital from "../../assets/clients/o2capital.png";
import raizers from "../../assets/clients/raizers.png";
import sanso from "../../assets/clients/sanso.png";
import tylia from "../../assets/clients/tylia.png";
import { useCovaltFonts, useInView } from "../../lib/hooks";
import type { ImageValue } from "../../lib/props";
import * as styles from "./CvClientsMarquee.module.css";

export const MAX_LOGOS = 12;

/** Logos par défaut (découpés dans des captures : à remplacer par les vectoriels officiels). */
export const DEFAULT_LOGOS: { src: string; alt: string; height: number }[] = [
  { src: raizers, alt: "Raizers", height: 30 },
  { src: tylia, alt: "Tylia Invest", height: 36 },
  { src: mcapital, alt: "M Capital", height: 16 },
  { src: arkea, alt: "Arkéa Crédit Bail", height: 24 },
  { src: o2capital, alt: "O2 Capital", height: 44 },
  { src: sanso, alt: "Sanso IS", height: 26 },
  { src: eurazeo, alt: "Eurazeo", height: 22 },
  { src: bpce, alt: "BPCE Lease", height: 30 },
  { src: interinvest, alt: "Inter Invest", height: 22 },
];

export type CvClientsMarqueeProps = {
  label?: string;
  durationS?: number;
  /** logo1..logo12 (Image) et logo1Height..logo12Height (px, 0 = masqué). */
  [key: `logo${number}`]: ImageValue;
  [key: `logo${number}Height`]: number | undefined;
};

type Logo = { src: string; alt: string; height: number };

export function resolveLogos(props: Record<string, unknown>): Logo[] {
  const out: Logo[] = [];
  for (let i = 1; i <= MAX_LOGOS; i++) {
    const img = props[`logo${i}`] as ImageValue;
    const h = props[`logo${i}Height`] as number | undefined;
    const def = DEFAULT_LOGOS[i - 1];
    const src = img?.src || def?.src;
    if (!src) continue;
    const height = typeof h === "number" ? h : (def?.height ?? 28);
    if (height <= 0) continue;
    out.push({ src, alt: img?.alt || def?.alt || "", height });
  }
  return out;
}

/** Bandeau « Ils nous font confiance » : défilement infini, pause au survol. */
export function CvClientsMarquee({ label = "Ils nous font confiance", durationS = 40, ...rest }: CvClientsMarqueeProps) {
  useCovaltFonts();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const logos = resolveLogos(rest);
  const group = (hidden: boolean) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {logos.map((l, i) => (
        <img key={i} className={styles.logo} src={l.src} alt={hidden ? "" : l.alt} style={{ height: l.height }} loading="lazy" />
      ))}
    </div>
  );
  return (
    <section className={`cv-root ${styles.section}`}>
      <div className={`cv-container ${styles.inner}`}>
        <span className={styles.label}>{label}</span>
        <div ref={ref} className={`${styles.viewport} ${inView ? "" : styles.paused}`}>
          <div className={styles.track} style={{ ["--mq-dur" as string]: `${Math.max(5, durationS)}s` }}>
            {group(false)}
            {group(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
