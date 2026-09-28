import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import logoConnect from "../../assets/offers/loan-connect.png";
import logoProtection from "../../assets/offers/loan-protection.png";
import logoServicing from "../../assets/offers/loan-servicing.png";
import { OFFER_SELECT, OFFERS_HOLD } from "../../lib/events";
import { pad2 } from "../../lib/format";
import { EASE_STANDARD, useCovaltFonts, useInView, usePausableTimer, useReducedMotion, useReveal } from "../../lib/hooks";
import { linkAttrs, pickImage, type ImageValue, type LinkValue } from "../../lib/props";
import { ProgressFill } from "../../lib/ProgressFill";
import { ConnectIllustration } from "../CvConnectIllustration/CvConnectIllustration";
import { ProtectionIllustration } from "../CvProtectionIllustration/CvProtectionIllustration";
import { ServicingIllustration } from "../CvServicingIllustration/CvServicingIllustration";
import * as styles from "./CvOffers.module.css";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type OfferKey = 1 | 2 | 3;
type OfferFields = "Eyebrow" | "Subtitle" | "Color" | "TextColor" | "PanelEyebrow" | "Title" | "Body" | "Bullet1" | "Bullet2" | "Bullet3" | "Bullet4" | "CtaLabel";

export type CvOffersProps = {
  sectionTitle?: string;
  sectionText?: string;
  tabMs?: number;
  initialTab?: string;
  illustration1?: ReactNode;
  illustration2?: ReactNode;
  illustration3?: ReactNode;
} & { [K in `offer${OfferKey}${OfferFields}`]?: string } & { [K in `offer${OfferKey}Logo`]?: ImageValue } & {
  [K in `offer${OfferKey}LogoHeight` | `offer${OfferKey}LogoOffset`]?: number;
} & { [K in `offer${OfferKey}CtaLink`]?: LinkValue };

type Offer = {
  eyebrow: string;
  logo: string;
  logoAlt: string;
  logoHeight: number;
  logoOffset: number;
  subtitle: string;
  color: string;
  textColor: string;
  panelEyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  ctaLabel: string;
};

export const OFFER_DEFAULTS: Offer[] = [
  {
    eyebrow: "01 — Sourcer",
    logo: logoConnect,
    logoAlt: "Loan Connect",
    logoHeight: 26,
    logoOffset: 0,
    subtitle: "Origination de nouveaux financements",
    color: "#007AA3",
    textColor: "#007AA3",
    panelEyebrow: "01 — Loan Connect · Origination",
    title: "Développez votre portefeuille avec des dossiers pré-qualifiés.",
    body: "Recevez des opportunités sélectionnées parmi plus de 800 M€ de financements mis en ligne, avec un Security Package proposé en amont par nos équipes.",
    bullets: ["Dossiers pré-sélectionnés selon vos critères", "Security Package proposé en amont", "Analyse crédit et documentation prêtes", "Mise en relation avec l'emprunteur"],
    ctaLabel: "Découvrir Loan Connect →",
  },
  {
    eyebrow: "02 — Sécuriser",
    logo: logoProtection,
    logoAlt: "Loan Protection",
    logoHeight: 40,
    logoOffset: -14,
    subtitle: "Sécurisation par fiducie et agency",
    color: "#24826B",
    textColor: "#24826B",
    panelEyebrow: "02 — Loan Protection · Fiducie & Agency",
    title: "Déléguez la sécurisation de vos financements. Externalisez le risque.",
    body: "En qualité de fiduciaire ou d'agent des sûretés, Covalt porte et suit vos garanties pour votre compte. La plateforme détecte les signaux faibles ; nos experts les analysent et agissent.",
    bullets: ["Structuration et suivi des sûretés", "Suivi des emprunteurs en temps réel", "Alerte et analyse par un expert dédié", "Réalisation des sûretés en cas de défaut"],
    ctaLabel: "Découvrir Loan Protection →",
  },
  {
    eyebrow: "03 — Administrer",
    logo: logoServicing,
    logoAlt: "Loan Servicing",
    logoHeight: 26,
    logoOffset: 0,
    subtitle: "Services tiers associés au financement",
    color: "#8A8A6A",
    textColor: "#6B6B4F",
    panelEyebrow: "03 — Loan Servicing · Administration",
    title: "Déchargez vos équipes du suivi administratif.",
    body: "Représentation de la masse, gestion extinctive, collecte des reportings : nos experts administrent vos opérations pour votre compte, jusqu'au remboursement final.",
    bullets: ["Représentation de la masse (RMO)", "Gestion extinctive (GEX)", "Collecte et contrôle des reportings", "Instruction des waivers et avenants"],
    ctaLabel: "Découvrir Loan Servicing →",
  },
];

export const TAB_OPTIONS = ["Loan Connect", "Loan Protection", "Loan Servicing"];

function resolveOffers(p: CvOffersProps): Offer[] {
  const rec = p as Record<string, unknown>;
  return OFFER_DEFAULTS.map((d, idx) => {
    const k = `offer${idx + 1}`;
    const str = (f: string, fb: string) => {
      const v = rec[k + f];
      return typeof v === "string" && v !== "" ? v : fb;
    };
    const num = (f: string, fb: number) => {
      const v = rec[k + f];
      return typeof v === "number" && !Number.isNaN(v) ? v : fb;
    };
    const logo = pickImage(rec[k + "Logo"] as ImageValue, d.logo, d.logoAlt);
    return {
      eyebrow: str("Eyebrow", d.eyebrow),
      logo: logo.src,
      logoAlt: logo.alt,
      logoHeight: num("LogoHeight", d.logoHeight),
      logoOffset: num("LogoOffset", d.logoOffset),
      subtitle: str("Subtitle", d.subtitle),
      color: str("Color", d.color),
      textColor: str("TextColor", str("Color", d.textColor)),
      panelEyebrow: str("PanelEyebrow", d.panelEyebrow),
      title: str("Title", d.title),
      body: str("Body", d.body),
      bullets: d.bullets.map((b, i) => str(`Bullet${i + 1}`, b)).filter(Boolean),
      ctaLabel: str("CtaLabel", d.ctaLabel),
    };
  });
}

/**
 * Section « offres » : 3 onglets à défilement automatique (ligne de
 * progression 2 px), verrouillage au clic, pause au survol, panneaux texte +
 * illustration animée. Chaque illustration peut être remplacée par un slot.
 */
export function CvOffers(props: CvOffersProps) {
  useCovaltFonts();
  const {
    sectionTitle = "Trois offres, un seul partenaire sur toute la vie du financement.",
    sectionText = "Covalt vous accompagne sur toute le cycle de vie de vos financements.",
    tabMs = 9000,
    initialTab = "Loan Protection",
    illustration1,
    illustration2,
    illustration3,
  } = props;
  const offers = resolveOffers(props);
  const rec = props as Record<string, unknown>;

  const rootRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useReveal(rootRef);
  const inView = useInView(innerRef);
  const reduced = useReducedMotion();

  const [tab, setTab] = useState(() => Math.max(0, TAB_OPTIONS.indexOf(initialTab)));
  const [cycle, setCycle] = useState(0);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [panelMin, setPanelMin] = useState(0);

  const running = inView && !paused && !hold && !locked && !reduced;

  const goTo = useCallback((i: number, lock: boolean) => {
    setTab(i);
    setCycle((c) => c + 1);
    if (lock) setLocked(true);
  }, []);

  usePausableTimer(running, Math.max(1000, tabMs), () => goTo((tab + 1) % 3, false), cycle);

  // Sélection depuis le header (ou tout autre composant).
  useEffect(() => {
    const onSelect = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      if (typeof i === "number" && i >= 0 && i < 3) goTo(i, true);
    };
    window.addEventListener(OFFER_SELECT, onSelect);
    return () => window.removeEventListener(OFFER_SELECT, onSelect);
  }, [goTo]);

  // Pause pendant qu'une popup ouverte par l'utilisateur est affichée.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onHold = (e: Event) => setHold(Boolean((e as CustomEvent<boolean>).detail));
    el.addEventListener(OFFERS_HOLD, onHold);
    return () => el.removeEventListener(OFFERS_HOLD, onHold);
  }, []);

  // Fondu ascendant du panneau à chaque changement d'onglet.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setHold(false);
    const panel = panelsRef.current?.querySelector<HTMLElement>(`[data-panel="${tab}"]`);
    if (!panel || reduced || typeof panel.animate !== "function") return;
    const anims = Array.from(panel.querySelectorAll<HTMLElement>("[data-panel-anim]")).map((el, i) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(20px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 700, delay: i * 90, easing: EASE_STANDARD, fill: "both" },
      ),
    );
    return () => anims.forEach((a) => a.cancel());
  }, [tab, reduced]);

  // Hauteur mini = plus grand panneau observé (évite les sauts de mise en page).
  useIsoLayoutEffect(() => {
    const wrap = panelsRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const panel = wrap.querySelector<HTMLElement>(`[data-panel="${tab}"]`);
    if (!panel) return;
    const ro = new ResizeObserver(() => {
      const h = Math.ceil(panel.getBoundingClientRect().height);
      setPanelMin((m) => (h > m ? h : m));
    });
    ro.observe(panel);
    return () => ro.disconnect();
  }, [tab]);
  useEffect(() => {
    let w = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      setPanelMin(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? 2 : (tab + dir + 3) % 3;
    goTo(next, true);
    tabRefs.current[next]?.focus();
  };

  const slots = [illustration1, illustration2, illustration3];
  const builtIns = [
    <ConnectIllustration key="c" color={offers[0].color} />,
    <ProtectionIllustration key="p" color={offers[1].color} />,
    <ServicingIllustration key="s" color={offers[2].color} />,
  ];

  return (
    <section ref={rootRef} className={`cv-root ${styles.section}`}>
      <div
        ref={innerRef}
        className={`cv-container ${styles.inner}`}
        data-reveal="1"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={styles.top}>
          <div className="cv-intro">
            <h2 className="cv-h2">{sectionTitle}</h2>
            <p className="cv-lead">{sectionText}</p>
          </div>
          <div className={styles.tabs} role="tablist" aria-label="Nos offres">
            {offers.map((o, i) => {
              const active = i === tab;
              return (
                <button
                  key={i}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`cv-offer-tab-${i}`}
                  aria-selected={active}
                  aria-controls={`cv-offer-panel-${i}`}
                  tabIndex={active ? 0 : -1}
                  className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                  onClick={() => goTo(i, true)}
                  onKeyDown={onTabKey}
                >
                  <span className={styles.tabBar}>
                    {active && (
                      <ProgressFill key={cycle} ms={Math.max(1000, tabMs)} running={running} color={o.color} full={locked || reduced} />
                    )}
                  </span>
                  <span className={styles.tabEyebrow} style={active ? { color: o.textColor } : undefined}>
                    {o.eyebrow}
                  </span>
                  <img
                    className={styles.tabLogo}
                    src={o.logo}
                    alt={o.logoAlt}
                    style={{ ["--logo-h" as string]: `${o.logoHeight}px`, ["--logo-offset" as string]: `${o.logoOffset}px` }}
                  />
                  <span className={styles.tabSub}>{o.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={panelsRef} className={styles.panels} style={{ ["--panel-min" as string]: `${panelMin}px` }}>
          {offers.map((o, i) => (
            <div
              key={i}
              data-panel={i}
              id={`cv-offer-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`cv-offer-tab-${i}`}
              hidden={i !== tab}
              className={styles.panel}
            >
              <div className={styles.copy} data-panel-anim="1">
                <div className={styles.panelEyebrow} style={{ color: o.textColor }}>
                  {o.panelEyebrow}
                </div>
                <h2 className="cv-h2">{o.title}</h2>
                <p className="cv-lead">{o.body}</p>
                <ul className={styles.bullets}>
                  {o.bullets.map((b, j) => (
                    <li key={j} className={styles.bullet}>
                      <span className={styles.bulletNum}>{pad2(j + 1)}</span>
                      <span className={styles.bulletText}>{b}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <a className="cv-btn cv-btn-ink" {...linkAttrs(rec[`offer${i + 1}CtaLink`] as LinkValue, "#contact")}>
                    {o.ctaLabel}
                  </a>
                </div>
              </div>
              <div className={styles.visual} data-panel-anim="1">
                {slots[i] ?? builtIns[i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
