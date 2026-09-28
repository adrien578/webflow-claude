import wordmark from "../../assets/covalt-wordmark.svg";
import { useCovaltFonts } from "../../lib/hooks";
import { linkAttrs, type ImageValue, type LinkValue } from "../../lib/props";
import * as styles from "./CvFooter.module.css";

type FooterLink = { label: string; link: LinkValue; fallback: string };

export type CvFooterProps = {
  logo?: ImageValue;
  tagline?: string;
  col1Title?: string;
  col2Title?: string;
  col3Title?: string;
  copyright?: string;
  legal?: string;
  legalLink?: LinkValue;
  /** col{1..3}Link{1..4}Label / col{1..3}Link{1..4} */
  [key: `col${number}Link${number}Label`]: string | undefined;
  [key: `col${number}Link${number}`]: LinkValue;
};

export const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "OFFRES",
    links: [
      { label: "Loan Connect", href: "#offres-detail" },
      { label: "Loan Protection", href: "#offres-detail" },
      { label: "Loan Servicing", href: "#offres-detail" },
    ],
  },
  {
    title: "COVALT",
    links: [
      { label: "Technologie", href: "#technologie" },
      { label: "Expertise", href: "#chiffres" },
      { label: "Ressources", href: "#" },
      { label: "Carrières", href: "#" },
    ],
  },
  {
    title: "CONTACT",
    links: [
      { label: "Obtenir une proposition", href: "#contact" },
      { label: "Connexion plateforme", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

export function CvFooter({
  logo,
  tagline = "Le partenaire des prêteurs pour sourcer, sécuriser et administrer leurs financements.",
  col1Title = FOOTER_COLUMNS[0].title,
  col2Title = FOOTER_COLUMNS[1].title,
  col3Title = FOOTER_COLUMNS[2].title,
  copyright = "© 2026 Covalt",
  legal = "Mentions légales · Confidentialité",
  legalLink,
  ...rest
}: CvFooterProps) {
  useCovaltFonts();
  const r = rest as Record<string, unknown>;
  const titles = [col1Title, col2Title, col3Title];
  const cols = FOOTER_COLUMNS.map((c, ci) => {
    const links: FooterLink[] = [];
    for (let li = 0; li < 4; li++) {
      const def = c.links[li];
      const lbl = r[`col${ci + 1}Link${li + 1}Label`];
      const label = typeof lbl === "string" ? lbl : (def?.label ?? "");
      if (!label) continue;
      links.push({ label, link: r[`col${ci + 1}Link${li + 1}`] as LinkValue, fallback: def?.href ?? "#" });
    }
    return { title: titles[ci], links };
  });
  return (
    <footer className={`cv-root ${styles.footer}`}>
      <div className={`cv-container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <img className={styles.logo} src={logo?.src || wordmark} alt={logo?.alt || "Covalt"} style={logo?.src ? undefined : { filter: "invert(1) brightness(2)" } /* wordmark foncé inversé, comme le prototype */} />
            <span className={styles.tagline}>{tagline}</span>
          </div>
          {cols.map((c, i) => (
            <nav key={i} className={styles.col} aria-label={c.title}>
              <span className={styles.colTitle}>{c.title}</span>
              {c.links.map((l, j) => (
                <a key={j} {...linkAttrs(l.link, l.fallback)}>
                  {l.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <span>{copyright}</span>
          <a {...linkAttrs(legalLink, "#")}>{legal}</a>
        </div>
      </div>
    </footer>
  );
}
