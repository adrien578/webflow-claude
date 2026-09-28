import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { emitOffersHold } from "../../lib/events";
import { useCovaltFonts, useInView, useInterval, useReducedMotion } from "../../lib/hooks";
import { CardHead, Stage } from "../shared/Stage";
import * as styles from "./CvConnectIllustration.module.css";

export type Deal = { name: string; obj: string; amount: string; sec: string; dur: string };

export const DEFAULT_DEALS: Deal[] = [
  { name: "Horizon Croissance", obj: "Financement immobilier", amount: "3 700 000 €", sec: "Fiducie-sûreté", dur: "48 mois" },
  { name: "Opération Centurion", obj: "Restructuration", amount: "15 250 999 €", sec: "Agent des sûretés", dur: "60 mois" },
  { name: "Initiative Rubis", obj: "Financement d'acquisition", amount: "11 700 999 €", sec: "Nantissement", dur: "72 mois" },
  { name: "Synergie Immo", obj: "Financement d'entreprise", amount: "8 500 000 €", sec: "Fiducie-gestion", dur: "36 mois" },
  { name: "Élan Finance", obj: "Financement immobilier", amount: "2 200 000 €", sec: "Fiducie-sûreté", dur: "24 mois" },
];

export const MAX_DEALS = 5;

export type CvConnectIllustrationProps = {
  title?: string;
  subtitle?: string;
  countLabel?: string;
  requestLabel?: string;
  confirmationText?: string;
  autoOpenDelayMs?: number;
  color?: string;
  backdrop?: boolean;
  /** deal1Name, deal1Object, deal1Amount, deal1Security, deal1Duration … deal5* */
  [key: `deal${number}${"Name" | "Object" | "Amount" | "Security" | "Duration"}`]: string | undefined;
};

export function resolveDeals(props: Record<string, unknown>): Deal[] {
  const out: Deal[] = [];
  for (let i = 1; i <= MAX_DEALS; i++) {
    const d = DEFAULT_DEALS[i - 1];
    const get = (k: string, fb: string) => {
      const v = props[`deal${i}${k}`];
      return typeof v === "string" ? v : fb;
    };
    const name = get("Name", d?.name ?? "");
    if (!name) continue;
    out.push({ name, obj: get("Object", d?.obj ?? ""), amount: get("Amount", d?.amount ?? ""), sec: get("Security", d?.sec ?? ""), dur: get("Duration", d?.dur ?? "") });
  }
  return out;
}

const HOLD_MS = 4500;
const TICK_MS = 3200;

/**
 * Tableau d'opérations pré-qualifiées (Loan Connect).
 * - Survol d'une ligne : fond #E8F3F7 ; clic : popup de mise en relation.
 * - Sans interaction, ouvre seul une opération au bout de `autoOpenDelayMs`,
 *   la referme après 4,5 s puis passe à la suivante. Le premier survol de la
 *   carte arrête ce déroulé automatique.
 * - Tant qu'une popup ouverte par l'utilisateur est affichée, l'événement
 *   `covalt:offers-hold` met en pause le défilement des onglets de CvOffers.
 */
export function ConnectIllustration({
  title = "Dossiers pré-qualifiés",
  subtitle = "Sélection pour votre profil de risque",
  countLabel = "210 opérations",
  requestLabel = "Demander une mise en relation",
  confirmationText = "Demande transmise à l'équipe Covalt.",
  autoOpenDelayMs = 3000,
  color = "#007AA3",
  backdrop = true,
  ...rest
}: CvConnectIllustrationProps) {
  const deals = resolveDeals(rest);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, 0.25);
  const reduced = useReducedMotion();

  const [sel, setSel] = useState<number | null>(null);
  const [selAuto, setSelAuto] = useState(false);
  const [lastSel, setLastSel] = useState(-1);
  const [requested, setRequested] = useState(false);
  const [touched, setTouched] = useState(false);
  const [tick, setTick] = useState(0);

  const n = deals.length;
  useInterval(() => setTick((t) => t + 1), TICK_MS, inView && !reduced && n > 0);

  // Réinitialisation quand l'illustration sort de l'écran (changement d'onglet).
  useEffect(() => {
    if (inView) return;
    setSel(null);
    setSelAuto(false);
    setTouched(false);
  }, [inView]);

  // Déroulé automatique : ouvre, attend 4,5 s, referme, recommence.
  useEffect(() => {
    if (!inView || touched || reduced || n === 0) return;
    if (sel === null) {
      const t = window.setTimeout(() => {
        const i = (lastSel + 2) % n;
        setSel(i);
        setSelAuto(true);
        setRequested(false);
        setLastSel(i);
      }, Math.max(0, autoOpenDelayMs));
      return () => window.clearTimeout(t);
    }
    if (selAuto) {
      const t = window.setTimeout(() => setSel(null), HOLD_MS);
      return () => window.clearTimeout(t);
    }
  }, [inView, touched, reduced, sel, selAuto, lastSel, n, autoOpenDelayMs]);

  // Pause des onglets tant qu'une popup ouverte par l'utilisateur est affichée.
  const userHold = sel !== null && !selAuto;
  useEffect(() => {
    emitOffersHold(rootRef.current, userHold);
  }, [userHold]);
  useEffect(() => {
    const el = rootRef.current;
    return () => emitOffersHold(el, false);
  }, []);

  const touch = () => {
    if (touched) return;
    setTouched(true);
    if (selAuto) setSelAuto(false);
  };
  const open = (i: number) => {
    setTouched(true);
    setSel(i);
    setSelAuto(false);
    setRequested(false);
    setLastSel(i);
  };
  const close = () => {
    setTouched(true);
    setSel(null);
  };
  const onRowKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(i);
    }
  };

  const hi = n ? tick % n : -1;
  const pop = deals[sel ?? Math.max(0, lastSel)] ?? deals[0];
  const isOpen = sel !== null;

  return (
    <div ref={rootRef} onKeyDown={(e) => e.key === "Escape" && isOpen && close()}>
      <Stage color={color} backdrop={backdrop} cardClassName={styles.card} cardProps={{ onMouseEnter: touch }}>
        <CardHead title={title} subtitle={subtitle} meta={countLabel} />
        <div className={styles.cols}>
          <span>Opération</span>
          <span className={styles.colDesktop}>Montant</span>
          <span className={styles.colDesktop}>Security Package</span>
          <span className={styles.colMobile}>Montant · Sûreté</span>
        </div>
        {deals.map((d, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            className={[styles.row, i === sel ? styles.selected : i === hi ? styles.hi : ""].join(" ")}
            onClick={() => open(i)}
            onKeyDown={onRowKey(i)}
          >
            <span className={styles.name}>
              <span className={styles.nameLine}>
                {d.name}
                <span className={styles.new}>NOUVEAU</span>
              </span>
              <span className={styles.obj}>{d.obj}</span>
            </span>
            <span className={styles.amountSec}>
              <span className={styles.amount}>{d.amount}</span>
              <span className={styles.pill}>{d.sec}</span>
            </span>
          </div>
        ))}

        <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`} aria-hidden={!isOpen}>
          {pop && (
            <div className={styles.popup} role="dialog" aria-label={pop.name}>
              <div className={styles.popHead}>
                <div className={styles.popTitle}>
                  <span>{pop.name}</span>
                  <span>{pop.obj}</span>
                </div>
                <button type="button" className={styles.close} aria-label="Fermer" onClick={close} tabIndex={isOpen ? 0 : -1}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className={styles.popBody}>
                <div className={styles.popLine}>
                  <span>Montant</span>
                  <span className={styles.mono}>{pop.amount}</span>
                </div>
                <div className={styles.popLine}>
                  <span>Durée</span>
                  <span className={styles.mono}>{pop.dur}</span>
                </div>
                <div className={styles.popLine}>
                  <span>Security Package</span>
                  <span className={styles.pill}>{pop.sec}</span>
                </div>
              </div>
              <div className={styles.popFoot}>
                {requested ? (
                  <div className={styles.done} role="status">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {confirmationText}
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.request}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => {
                      setTouched(true);
                      setRequested(true);
                      setSelAuto(false);
                    }}
                  >
                    {requestLabel}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Stage>
    </div>
  );
}

/** Composant autonome pour le Designer. */
export function CvConnectIllustration(props: CvConnectIllustrationProps) {
  useCovaltFonts();
  return (
    <div className="cv-root">
      <ConnectIllustration {...props} />
    </div>
  );
}
