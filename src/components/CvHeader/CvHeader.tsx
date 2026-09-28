import { useEffect, useState, type MouseEvent } from "react";
import wordmark from "../../assets/covalt-wordmark.svg";
import { selectOffer } from "../../lib/events";
import { useCovaltFonts } from "../../lib/hooks";
import { linkAttrs, pickImage, type ImageValue, type LinkValue } from "../../lib/props";
import * as styles from "./CvHeader.module.css";

export type CvHeaderProps = {
  logo?: ImageValue;
  homeLink?: LinkValue;
  offer1Label?: string;
  offer2Label?: string;
  offer3Label?: string;
  offersLink?: LinkValue;
  techLabel?: string;
  techLink?: LinkValue;
  expertiseLabel?: string;
  expertiseLink?: LinkValue;
  structuroLabel?: string;
  structuroLink?: LinkValue;
  casesLabel?: string;
  casesLink?: LinkValue;
  loginLabel?: string;
  loginLink?: LinkValue;
  ctaLabel?: string;
  ctaShortLabel?: string;
  ctaLink?: LinkValue;
};

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    {open ? (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ) : (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    )}
  </svg>
);

/** Header sticky : navigation desktop, menu burger plein écran sous 992 px. */
export function CvHeader({
  logo,
  homeLink,
  offer1Label = "Loan Connect",
  offer2Label = "Loan Protection",
  offer3Label = "Loan Servicing",
  offersLink,
  techLabel = "Technologie",
  techLink,
  expertiseLabel = "Expertise",
  expertiseLink,
  structuroLabel = "Structuro",
  structuroLink,
  casesLabel = "Cas clients",
  casesLink,
  loginLabel = "Connexion",
  loginLink,
  ctaLabel = "Obtenir une proposition",
  ctaShortLabel = "Proposition",
  ctaLink,
}: CvHeaderProps) {
  useCovaltFonts();
  const [open, setOpen] = useState(false);
  const logoImg = pickImage(logo, wordmark, "Covalt");
  const offers = [offer1Label, offer2Label, offer3Label];
  const offersHref = linkAttrs(offersLink, "#offres-detail");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const pickOffer = (i: number) => (_e: MouseEvent) => {
    selectOffer(i);
    close();
  };

  const covaltLinks = [
    { label: techLabel, link: linkAttrs(techLink, "#technologie") },
    { label: expertiseLabel, link: linkAttrs(expertiseLink, "#chiffres") },
    { label: structuroLabel, link: linkAttrs(structuroLink, "#structuro") },
    { label: casesLabel, link: linkAttrs(casesLink, "#temoignages") },
  ];

  return (
    <header className={`cv-root ${styles.header}`}>
      <div className={`cv-container ${styles.bar}`}>
        <a className={styles.logoLink} {...linkAttrs(homeLink, "#top")} onClick={close}>
          <img className={styles.logo} src={logoImg.src} alt={logoImg.alt} />
        </a>
        <nav className={styles.nav} aria-label="Navigation principale">
          {offers.map((label, i) => (
            <a key={i} {...offersHref} onClick={pickOffer(i)}>
              {label}
            </a>
          ))}
          <a {...covaltLinks[0].link}>{techLabel}</a>
          <a {...covaltLinks[2].link}>{structuroLabel}</a>
        </nav>
        <div className={styles.actions}>
          <a className={styles.login} {...linkAttrs(loginLink, "#")}>
            {loginLabel}
          </a>
          <a className={`cv-btn cv-btn-ink ${styles.cta} ${styles.ctaFull}`} {...linkAttrs(ctaLink, "#contact")}>
            {ctaLabel}
          </a>
          <a className={`cv-btn cv-btn-ink ${styles.ctaShort}`} {...linkAttrs(ctaLink, "#contact")} onClick={close}>
            {ctaShortLabel}
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-label={open ? "Fermer le menu" : "Menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div className={`${styles.menu} ${open ? styles.menuOpen : ""}`} hidden={!open}>
        <span className={styles.menuLabel}>NOS OFFRES</span>
        {offers.map((label, i) => (
          <a key={i} className={styles.menuLink} {...offersHref} onClick={pickOffer(i)}>
            {label}
            <span className={styles.menuArrow}>→</span>
          </a>
        ))}
        <span className={`${styles.menuLabel} ${styles.menuLabelSpaced}`}>COVALT</span>
        {covaltLinks.map(({ label, link }) => (
          <a key={label} className={styles.menuLink} {...link} onClick={close}>
            {label}
            <span className={styles.menuArrow}>→</span>
          </a>
        ))}
        <div className={styles.menuCtas}>
          <a className="cv-btn cv-btn-green" {...linkAttrs(ctaLink, "#contact")} onClick={close}>
            {ctaLabel}
          </a>
          <a className="cv-btn cv-btn-outline" {...linkAttrs(loginLink, "#")}>
            {loginLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
