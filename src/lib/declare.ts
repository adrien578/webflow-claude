import { props } from "@webflow/data-types";

/**
 * Aides pour déclarer des séries de props numérotées (deal1Name, deal2Name…)
 * dans les fichiers *.webflow.tsx. DevLink gère mal les tableaux : chaque
 * entrée de liste devient un jeu de props à nombre fixe, rangées par groupe
 * dans le panneau Propriétés.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropMap = Record<string, any>;

export const text = (name: string, defaultValue: string, group?: string, tooltip?: string) =>
  props.Text({ name, defaultValue, group, tooltip });

export const num = (name: string, defaultValue: number, opts: { min?: number; max?: number; decimals?: number; group?: string; tooltip?: string } = {}) =>
  props.Number({ name, defaultValue, ...opts });

export const image = (name: string, group?: string, tooltip?: string) => props.Image({ name, group, tooltip });

export const link = (name: string, group?: string, tooltip?: string) => props.Link({ name, group, tooltip });

export const bool = (name: string, defaultValue: boolean, group?: string, tooltip?: string) => props.Boolean({ name, defaultValue, group, tooltip });

/** Construit `count` jeux de props à partir d'une fabrique par index (1-based). */
export function series(count: number, make: (i: number) => PropMap): PropMap {
  const out: PropMap = {};
  for (let i = 1; i <= count; i++) Object.assign(out, make(i));
  return out;
}
