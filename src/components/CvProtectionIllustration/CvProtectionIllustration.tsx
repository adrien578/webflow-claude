import { useEffect, useRef, useState } from "react";
import { fmt } from "../../lib/format";
import { useCovaltFonts, useInView, useInterval, useReducedMotion } from "../../lib/hooks";
import { linkAttrs, type ImageValue, type LinkValue } from "../../lib/props";
import { CardHead, Stage } from "../shared/Stage";
import * as styles from "./CvProtectionIllustration.module.css";

type PoolItem = { label: string; cat: string; amt: number };
type Tx = { id: number; date: string; label: string; cat: string; amt: number; fresh: boolean };

/** Flux de transactions simulées (les retraits > 50 000 € déclenchent l'alerte). */
const POOL: PoolItem[] = [
  { label: "Virement banque CAC", cat: "Virements", amt: 50000 },
  { label: "Retrait compte séquestre", cat: "Retraits, chq. et vir.", amt: -60000 },
  { label: "Prélèvement taxe", cat: "Taxes", amt: -4620 },
  { label: "Encaissement client", cat: "Ventes", amt: 38450 },
  { label: "Loyer siège", cat: "Dépenses pro", amt: -12300 },
  { label: "Salaires Stroke Effect", cat: "Salaires", amt: -100000 },
];
const INITIAL: PoolItem[] = [
  { label: "Salaires Stroke Effect", cat: "Salaires", amt: -100000 },
  { label: "Encaissement client", cat: "Ventes", amt: 38450 },
  { label: "Prélèvement taxe", cat: "Taxes", amt: -4620 },
];
const START_BALANCE = 187000.7;
const FEED_MS = 3200;
const BIG_WITHDRAWAL = -50000;

const today = () => new Date().toLocaleDateString("fr-FR");

export type CvProtectionIllustrationProps = {
  operationName?: string;
  accountLabel?: string;
  statusLabel?: string;
  balanceLabel?: string;
  thresholdLabel?: string;
  thresholdValue?: string;
  expertName?: string;
  expertRole?: string;
  expertPhoto?: ImageValue;
  alertTitle?: string;
  alertTime?: string;
  messageTime?: string;
  alertText?: string;
  actionPrimary?: string;
  actionPrimaryLink?: LinkValue;
  actionSecondary?: string;
  actionSecondaryLink?: LinkValue;
  color?: string;
  backdrop?: boolean;
};

/** Anime un nombre vers sa nouvelle valeur (easeOutCubic). */
function useTweened(target: number, ms = 700): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const v = start + (target - start) * (1 - Math.pow(1 - t, 3));
      from.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/**
 * Compte séquestre sous surveillance (Loan Protection) : solde animé, flux de
 * transactions, alerte « Bris de covenant détecté » puis intervention de
 * l'expert (indicateur de saisie → message → 2 actions).
 */
export function ProtectionIllustration({
  operationName = "Opération Invest",
  accountLabel = "Compte séquestre N°00090192183",
  statusLabel = "Surveillance active",
  balanceLabel = "Solde en temps réel",
  thresholdLabel = "Seuil d'alerte",
  thresholdValue = "150 000 €",
  expertName = "Arthur Bertin",
  expertRole = "Chargé de sûretés",
  expertPhoto,
  alertTitle = "Bris de covenant détecté",
  alertTime = "14:02",
  messageTime = "14:09",
  alertText = "Un retrait de 60 000 € a été détecté, correspondant à un bris de covenant de la documentation de financement. L'opération inclut une fiducie sur bien immobilier. Que souhaitez-vous faire ?",
  actionPrimary = "Demander l'activation de la sûreté",
  actionPrimaryLink,
  actionSecondary = "Échanger avec l'emprunteur",
  actionSecondaryLink,
  color = "#24826B",
  backdrop = true,
}: CvProtectionIllustrationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const reduced = useReducedMotion();

  // Dates calculées côté client uniquement (rendu serveur stable).
  const [txs, setTxs] = useState<Tx[]>(() => INITIAL.map((p, i) => ({ id: -i - 1, date: "", ...p, fresh: false })));
  const [balance, setBalance] = useState(START_BALANCE);
  const [txn, setTxn] = useState(0);
  const [stage, setStage] = useState(0); // 0 rien · 1 alerte · 2 saisie · 3 message
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const now = Date.now();
    setTxs((list) => list.map((t, i) => (t.date ? t : { ...t, date: new Date(now - (i + 1) * 3 * 864e5).toLocaleDateString("fr-FR") })));
  }, []);

  // Animations réduites : on montre directement l'état final (alerte + message).
  useEffect(() => {
    if (reduced) setStage(3);
  }, [reduced]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useInterval(
    () => {
      const p = POOL[txn % POOL.length];
      let next = balance + p.amt;
      if (next < 60000) next += 180000;
      setBalance(next);
      setTxn((x) => x + 1);
      setTxs((list) => [{ id: txn, date: today(), ...p, fresh: true }, ...list.map((t) => ({ ...t, fresh: false }))].slice(0, 3));
      later(() => setTxs((list) => list.map((t) => ({ ...t, fresh: false }))), 1400);
      if (p.amt < BIG_WITHDRAWAL) {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
        setStage(1);
        later(() => setStage(2), 1100);
        later(() => setStage(3), 2800);
        later(() => setTxs((list) => list.map((t) => ({ ...t, fresh: false }))), 1400);
      }
    },
    FEED_MS,
    inView && !reduced,
  );

  const shown = useTweened(balance);
  const initials = expertName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const alert = (
    <div className={`${styles.alert} ${stage ? styles.alertOn : ""}`} role="status" aria-live="polite">
      <div className={styles.alertHead}>
        <span className={styles.pulse}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E0FEB3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          </svg>
        </span>
        <span className={styles.alertTitle}>{alertTitle}</span>
        <span className={styles.time}>{alertTime}</span>
      </div>
      <div className={`${styles.human} ${stage >= 2 ? styles.humanOn : ""}`}>
        {expertPhoto?.src ? (
          <img className={styles.photo} src={expertPhoto.src} alt={expertPhoto.alt || expertName} />
        ) : (
          <span className={`${styles.photo} ${styles.photoPlaceholder}`} aria-hidden="true">
            {initials}
          </span>
        )}
        <div className={styles.msg}>
          <div className={styles.who}>
            <span className={styles.name}>
              {expertName}{" "}
              <span className={styles.role}>
                <span className={styles.sep}>· </span>
                {expertRole}
              </span>
            </span>
            <span className={styles.time}>{messageTime}</span>
          </div>
          {stage === 2 && (
            <span className={styles.dots} aria-label="En train d'écrire">
              <span />
              <span />
              <span />
            </span>
          )}
          {stage === 3 && (
            <>
              <span className={styles.text}>{alertText}</span>
              <div className={styles.actions}>
                <a className={styles.primary} {...linkAttrs(actionPrimaryLink, "#contact")}>
                  {actionPrimary}
                </a>
                <a className={styles.secondary} {...linkAttrs(actionSecondaryLink, "#contact")}>
                  {actionSecondary}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={rootRef}>
      <Stage color={color} backdrop={backdrop} className={styles.stage} after={alert}>
        <CardHead
          title={operationName}
          subtitle={accountLabel}
          meta={
            <span className={styles.status}>
              <span className={styles.blink} />
              {statusLabel}
            </span>
          }
        />
        <div className={styles.kpis}>
          <div className={styles.kpi}>
            <span className={styles.kpiLabel}>{balanceLabel}</span>
            <span className={styles.kpiValue}>{fmt(shown)} €</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiLabel}>{thresholdLabel}</span>
            <span className={`${styles.kpiValue} ${styles.muted}`}>{thresholdValue}</span>
          </div>
        </div>
        {txs.map((t) => (
          <div key={t.id} className={styles.tx} style={t.fresh ? { background: t.amt < BIG_WITHDRAWAL ? "#FBE9E6" : "var(--color-green-100)" } : undefined}>
            <span className={styles.date}>{t.date}</span>
            <span className={styles.txLabel}>
              <span>{t.label}</span>
              <span>{t.cat}</span>
            </span>
            <span className={styles.txAmount} style={{ color: t.amt > 0 ? "var(--color-green-500)" : "var(--color-ink)" }}>
              {(t.amt > 0 ? "+" : "") + fmt(t.amt)}
            </span>
          </div>
        ))}
        <div className={styles.spacer} />
      </Stage>
    </div>
  );
}

export function CvProtectionIllustration(props: CvProtectionIllustrationProps) {
  useCovaltFonts();
  return (
    <div className="cv-root">
      <ProtectionIllustration {...props} />
    </div>
  );
}
