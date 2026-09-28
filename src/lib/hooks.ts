import { useEffect, useRef, useState, type RefObject } from "react";
import { ensureFonts } from "./fonts";

export const EASE_STANDARD = "cubic-bezier(0.2,0,0,1)";
export const EASE_EMPHASIZED = "cubic-bezier(0.3,0,0,1)";

/** Charge les polices Covalt dans le document (une seule fois). */
export function useCovaltFonts(): void {
  useEffect(() => {
    ensureFonts();
  }, []);
}

/** `true` si l'utilisateur a demandé à réduire les animations. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Visibilité continue d'un élément (IntersectionObserver). Sert à mettre en
 * pause les minuteries quand le composant n'est pas à l'écran.
 */
export function useInView<T extends Element>(ref: RefObject<T | null>, threshold = 0): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}

/**
 * Apparitions au scroll : chaque élément `[data-reveal]` du conteneur passe de
 * opacity 0 / translateY(28px) à son état final en 900 ms (courbe standard),
 * avec un délai optionnel `data-reveal-delay` (ms). Désactivé si
 * prefers-reduced-motion : le contenu est alors visible immédiatement.
 */
export function useReveal<T extends HTMLElement>(rootRef: RefObject<T | null>, enabled = true): void {
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || reduced) return;
    if (typeof IntersectionObserver === "undefined" || typeof root.animate !== "function") return;

    const anims = new Map<Element, Animation>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          anims.get(e.target)?.play();
          io.unobserve(e.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      const a = el.animate(
        [
          { opacity: 0, transform: "translateY(28px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 900, easing: EASE_STANDARD, fill: "both", delay: Number(el.dataset.revealDelay || 0) },
      );
      a.pause();
      anims.set(el, a);
      io.observe(el);
    });
    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, [rootRef, enabled, reduced]);
}

/**
 * Horloge par pas de `stepMs` qui n'avance que lorsque `running` est vrai.
 * Utilisée pour les défilements automatiques (onglets, témoignages) afin que
 * la pause au survol / hors écran reprenne exactement là où elle s'est
 * arrêtée, en phase avec la barre de progression CSS.
 */
export function usePausableTimer(running: boolean, durationMs: number, onElapsed: () => void, resetKey: unknown): void {
  const elapsed = useRef(0);
  const cb = useRef(onElapsed);
  cb.current = onElapsed;

  useEffect(() => {
    elapsed.current = 0;
  }, [resetKey]);

  useEffect(() => {
    if (!running) return;
    const step = 100;
    const id = window.setInterval(() => {
      elapsed.current += step;
      if (elapsed.current >= durationMs) {
        elapsed.current = 0;
        cb.current();
      }
    }, step);
    return () => window.clearInterval(id);
  }, [running, durationMs]);
}

/** Intervalle simple, nettoyé au démontage, actif seulement si `running`. */
export function useInterval(callback: () => void, delayMs: number, running: boolean): void {
  const cb = useRef(callback);
  cb.current = callback;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => cb.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs, running]);
}
