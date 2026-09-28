/** Formatage monétaire / numérique à la française (espaces fines, virgule). */
export const fmt = (n: number, decimals = 2): string =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Découpe une liste saisie dans Webflow (« a, b, c » ou une entrée par ligne). */
export const splitList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

export const pad2 = (n: number): string => String(n).padStart(2, "0");
