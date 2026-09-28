import { useRef, useState } from "react";
import logoO2 from "../../assets/logo-o2capital.png";
import logoSeven from "../../assets/logo-sevenpartners.png";
import { pad2 } from "../../lib/format";
import { useCovaltFonts, useInView, usePausableTimer, useReducedMotion, useReveal } from "../../lib/hooks";
import type { ImageValue } from "../../lib/props";
import { ProgressFill } from "../../lib/ProgressFill";
import * as styles from "./CvTestimonials.module.css";

type Item = { quote: string; name: string; company: string; logo: string; logoHeight: number; offer: string };

export const DEFAULT_TESTIMONIALS: Item[] = [
  {
    name: "Yvan Gouchon",
    company: "Seven Partners",
    logo: logoSeven,
    logoHeight: 40,
    offer: "Loan Protection",
    quote:
      "Dans un environnement économique plus incertain, il est essentiel de renforcer la sécurité des opérations sans les complexifier. C'est dans cette optique que nous avons fait le choix de nous appuyer sur les services Covalt Loan Protection. En externalisant le rôle d'agent des sûretés à leurs équipes d'experts, nous bénéficions d'un suivi structuré. Covalt assure pour nous un ensemble de contrôles clés et nous alerte en cas d'incident sur nos financements, ce qui nous permet d'activer rapidement les leviers adéquats.",
  },
  {
    name: "Charly Abessolo",
    company: "O2 Capital",
    logo: logoO2,
    logoHeight: 48,
    offer: "Plateforme Covalt",
    quote:
      "Le suivi des covenants et des sûretés est un levier important de maîtrise du risque dans notre activité, mais il mobilisait jusqu'ici beaucoup de ressources. Avant Covalt, nous fonctionnions avec des rappels manuels (emails, téléphone) et des tableaux Excel. Depuis, tout est centralisé sur une plateforme collaborative et les rappels sont automatisés. Nous recevons des alertes précises à chaque échéance, ce qui nous permet d'être proactifs et de ne rien louper dans le suivi de nos financements.",
  },
];
export const MAX_TESTIMONIALS = 4;

export type CvTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  intervalMs?: number;
  /** item1Quote, item1Name, item1Company, item1Offer, item1Logo, item1LogoHeight … item4* */
  [key: `item${number}${"Quote" | "Name" | "Company" | "Offer"}`]: string | undefined;
  [key: `item${number}Logo`]: ImageValue;
  [key: `item${number}LogoHeight`]: number | undefined;
};

function resolveItems(p: Record<string, unknown>): Item[] {
  const out: Item[] = [];
  for (let i = 1; i <= MAX_TESTIMONIALS; i++) {
    const d = DEFAULT_TESTIMONIALS[i - 1];
    const s = (k: string, fb = "") => (typeof p[`item${i}${k}`] === "string" ? (p[`item${i}${k}`] as string) : fb);
    const quote = s("Quote", d?.quote);
    if (!quote) continue;
    const img = p[`item${i}Logo`] as ImageValue;
    const h = p[`item${i}LogoHeight`];
    out.push({
      quote,
      name: s("Name", d?.name),
      company: s("Company", d?.company),
      offer: s("Offer", d?.offer),
      logo: img?.src || d?.logo || "",
      logoHeight: typeof h === "number" ? h : (d?.logoHeight ?? 40),
    });
  }
  return out;
}

const ArrowIcon = ({ dir }: { dir: "prev" | "next" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "prev" ? (
      <>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </>
    ) : (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    )}
  </svg>
);

/** Carrousel de témoignages : auto toutes les 8 s, pause au survol, flèches, barres cliquables. */
export function CvTestimonials({ eyebrow = "Cas clients", title = "Ils nous confient leurs financements.", intervalMs = 8000, ...rest }: CvTestimonialsProps) {
  useCovaltFonts();
  const items = resolveItems(rest);
  const n = items.length;
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useReveal(root);
  const inView = useInView(inner);
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const ms = Math.max(2000, intervalMs);
  const running = inView && !paused && !reduced && n > 1;

  const go = (i: number) => {
    setIdx(((i % n) + n) % n);
    setCycle((c) => c + 1);
  };
  usePausableTimer(running, ms, () => go(idx + 1), cycle);

  if (!n) return null;
  return (
    <section ref={root} className={`cv-root ${styles.section}`} aria-roledescription="carrousel" aria-label={title}>
      <div ref={inner} className={`cv-container ${styles.inner}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className={styles.head}>
          <div className={styles.heading} data-reveal="1">
            <div className="cv-eyebrow">{eyebrow}</div>
            <h2 className="cv-h2">{title}</h2>
          </div>
          <div className={styles.controls} data-reveal="1">
            <span className={styles.count} aria-live="polite">
              {pad2(idx + 1)} / {pad2(n)}
            </span>
            <div className={styles.arrows}>
              <button type="button" className={styles.arrow} aria-label="Précédent" onClick={() => go(idx - 1)}>
                <ArrowIcon dir="prev" />
              </button>
              <button type="button" className={styles.arrow} aria-label="Suivant" onClick={() => go(idx + 1)}>
                <ArrowIcon dir="next" />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.card} data-reveal="1">
          <div className={styles.stack}>
            {items.map((t, i) => (
              <div key={i} className={`${styles.item} ${i === idx ? styles.current : ""}`} aria-hidden={i !== idx} role="group" aria-roledescription="témoignage" aria-label={`${i + 1} / ${n}`}>
                <blockquote className={styles.quoteBlock}>
                  <span className={styles.mark} aria-hidden="true">
                    “
                  </span>
                  <p className={styles.quote}>{t.quote}</p>
                </blockquote>
                <div className={styles.aside}>
                  {t.logo ? <img className={styles.logo} src={t.logo} alt={t.company} style={{ height: t.logoHeight }} /> : <span />}
                  <div className={styles.person}>
                    <div className={styles.who}>
                      <span className={styles.name}>{t.name}</span>
                      <span className={styles.company}>{t.company}</span>
                    </div>
                    {t.offer && <span className={styles.offer}>{t.offer}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.dots} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {items.map((t, i) => (
              <button key={i} type="button" className={styles.dot} aria-label={`Témoignage ${i + 1} : ${t.company}`} aria-current={i === idx} onClick={() => go(i)}>
                <span className={styles.dotTrack}>{i === idx && <ProgressFill key={cycle} ms={ms} running={running} full={reduced} />}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
