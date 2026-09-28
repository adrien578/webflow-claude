/** Valeurs des props Image / Link telles que Webflow les transmet. */
export type ImageValue = { src: string; alt?: string } | undefined | null;
export type LinkValue = { href: string; target?: string; preload?: string } | undefined | null;

/** Image choisie dans Webflow, sinon l'image par défaut embarquée dans le bundle. */
export function pickImage(value: ImageValue, fallbackSrc: string, fallbackAlt = ""): { src: string; alt: string } {
  if (value && value.src) return { src: value.src, alt: value.alt ?? fallbackAlt };
  return { src: fallbackSrc, alt: fallbackAlt };
}

/** Attributs d'un lien Webflow, avec une destination par défaut. */
export function linkAttrs(value: LinkValue, fallbackHref = "#"): { href: string; target?: string; rel?: string } {
  const href = value?.href || fallbackHref;
  const target = value?.target && value.target !== "_self" ? value.target : undefined;
  return { href, target, rel: target === "_blank" ? "noopener noreferrer" : undefined };
}
