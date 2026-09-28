import { useRef, useState, type HTMLAttributes } from "react";
import { splitList } from "../../lib/format";
import { useCovaltFonts, useInView, useInterval, useReducedMotion, useReveal } from "../../lib/hooks";
import * as styles from "./CvHeroRotator.module.css";

export type CvHeroRotatorProps = {
  prefix?: string;
  lead?: string;
  /** Mots séparés par des virgules. */
  words?: string;
  suffix?: string;
  intervalMs?: number;
};

export const HERO_ROTATOR_DEFAULTS = {
  prefix: "Le partenaire des prêteurs",
  lead: "pour",
  words: "sourcer, sécuriser, administrer",
  suffix: "leurs financements.",
  intervalMs: 1000,
} satisfies Required<CvHeroRotatorProps>;

/**
 * Titre h1 du hero avec mot rotatif : les mots sont superposés
 * (grid-area 1/1), l'actif en translateY(0), le précédent sort à -105 %, le
 * suivant attend à 105 %.
 */
export function HeroRotatorTitle({
  prefix = HERO_ROTATOR_DEFAULTS.prefix,
  lead = HERO_ROTATOR_DEFAULTS.lead,
  words = HERO_ROTATOR_DEFAULTS.words,
  suffix = HERO_ROTATOR_DEFAULTS.suffix,
  intervalMs = HERO_ROTATOR_DEFAULTS.intervalMs,
  ...rest
}: CvHeroRotatorProps & HTMLAttributes<HTMLHeadingElement>) {
  const list = splitList(words);
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const n = Math.max(1, list.length);
  const current = idx % n;

  useInterval(() => setIdx((i) => (i + 1) % n), Math.max(300, intervalMs), inView && !reduced && n > 1);

  const prev = (current + n - 1) % n;
  return (
    <h1 ref={ref} className={styles.title} {...rest}>
      {prefix}
      <br />
      {lead ? `${lead} ` : null}
      <span className={styles.srOnly}>{list.join(", ")}</span>
      <span className={styles.rotator} aria-hidden="true">
        {list.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className={[styles.word, i === current ? styles.active : "", i === prev && n > 2 ? styles.prev : ""].join(" ")}
          >
            {w}
          </span>
        ))}
      </span>
      <br />
      {suffix}
    </h1>
  );
}

/** Composant autonome (utilisable seul dans le Designer). */
export function CvHeroRotator(props: CvHeroRotatorProps) {
  useCovaltFonts();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return (
    <div ref={root} className="cv-root">
      <HeroRotatorTitle {...props} data-reveal="1" data-reveal-delay="80" />
    </div>
  );
}
